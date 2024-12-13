import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Friend } from '../../entities/friend.entity';
import { User } from '../../entities/user.entity';

@Injectable()
export class FriendService {
  constructor(
    @InjectRepository(Friend)
    private readonly friendRepository: Repository<Friend>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async sendFriendRequest(userId: string, friendId: string): Promise<Friend> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    const friend = await this.userRepository.findOne({
      where: { id: friendId },
    });

    if (!user || !friend) {
      throw new NotFoundException('User or Friend not found');
    }

    const existingConnection = await this.friendRepository.findOne({
      where: { user: { id: userId }, friend: { id: friendId } },
    });

    if (existingConnection) {
      throw new Error('Friend request already exists');
    }

    const newFriendRequest = this.friendRepository.create({
      user,
      friend,
      initiatedBy: userId,
      status: 'PENDING',
    });

    return this.friendRepository.save(newFriendRequest);
  }

  async acceptFriendRequest(userId: string, friendId: string): Promise<Friend> {
    const friendRequest = await this.friendRepository.findOne({
      where: {
        user: { id: friendId },
        friend: { id: userId },
        status: 'PENDING',
      },
    });

    if (!friendRequest) {
      throw new NotFoundException('Friend request not found');
    }

    friendRequest.status = 'ACCEPTED';
    return this.friendRepository.save(friendRequest);
  }

  async blockUser(
    userId: string,
    friendId: string,
    reason?: string,
  ): Promise<Friend> {
    const friendConnection = await this.friendRepository.findOne({
      where: { user: { id: userId }, friend: { id: friendId } },
    });

    if (!friendConnection) {
      throw new NotFoundException('Connection not found');
    }

    friendConnection.status = 'BLOCKED';
    friendConnection.blockedReason = reason;
    return this.friendRepository.save(friendConnection);
  }

  async deleteFriendRequestById(friendRequestId: string): Promise<void> {
    // Find the friend request by its ID
    const friendRequest = await this.friendRepository.findOne({
      where: { id: friendRequestId },
    });

    // Throw an error if the request is not found or is not pending
    if (!friendRequest) {
      throw new NotFoundException('Pending friend request not found');
    }

    await this.friendRepository.remove(friendRequest);
  }

  async listFriends(userId: string): Promise<Friend[]> {
    return this.friendRepository.find({
      where: [
        { user: { id: userId }, status: 'ACCEPTED' },
        { friend: { id: userId }, status: 'ACCEPTED' },
      ],
      relations: ['user', 'friend'],
    });
  }

  async listPendingRequests(userId: string): Promise<Friend[]> {
    return this.friendRepository.find({
      where: [
        { user: { id: userId }, status: 'PENDING' }, // Requests sent by the user
        { friend: { id: userId }, status: 'PENDING' }, // Requests received by the user
      ],
      relations: ['user', 'friend'], // To include user and friend details in the response
    });
  }

  // New Method for Suggesting Random Friends
  async suggestFriends(userId: string, limit: number = 5): Promise<User[]> {
    // Find the IDs of users who are already friends
    const friends = await this.friendRepository
      .createQueryBuilder('friend')
      .select(['friend.userId', 'friend.friendId'])
      .where(
        '(friend.userId = :userId OR friend.friendId = :userId) AND friend.status = :status',
        { userId, status: 'ACCEPTED' },
      )
      .getMany();

    // Extract the list of friend IDs
    const friendIds = friends.flatMap((friend) => [
      friend.user.id, // Assuming friend.userId and friend.friendId are UUIDs
      friend.friend.id,
    ]);

    // Remove the current userId from the list to avoid suggesting the user themselves
    const filteredFriendIds = friendIds.filter((id) => id !== userId);

    // Find all users who are not friends
    const suggestedFriendsQuery = this.userRepository
      .createQueryBuilder('user')
      .where('user.id != :userId', { userId }) // exclude the current user
      .orderBy('RANDOM()') // randomize the results
      .limit(limit); // return a limit of users

    // If there are filtered friends, exclude them from the suggested friends list
    if (filteredFriendIds.length > 0) {
      suggestedFriendsQuery.andWhere('user.id NOT IN (:...friendIds)', {
        friendIds: filteredFriendIds,
      });
    }

    // Execute the query
    const suggestedFriends = await suggestedFriendsQuery.getMany();

    return suggestedFriends;
  }
}
