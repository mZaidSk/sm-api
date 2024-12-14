import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { User } from '../../entities/user.entity';
import { CreateUserDto } from '../../dto/create-user.dto';
import { UpdateUserDto } from '../../dto/update-user.dto';
import { Friend } from '../../entities/friend.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const newUser = this.userRepository.create(createUserDto);
    return await this.userRepository.save(newUser);
  }

  async findAll(): Promise<User[]> {
    return await this.userRepository.find();
  }

  async findOne(
    id: string,
    authUserId?: string,
  ): Promise<User & { friend?: Friend }> {
    // Fetch the user with initial relations
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['posts', 'posts.reactions'],
    });

    if (!user) return null;

    // If no authUserId is provided, we assume it's for the authenticated user's own info
    // if (!authUserId || authUserId === id) {
    //   return {
    //     ...user,
    //     friend: undefined, // No friend status for self
    //   };
    // }

    // Fetch the friend status
    const friend = await this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect(
        'Friend',
        'friend',
        '(friend.user.id = :authUserId AND friend.friend.id = :id) OR (friend.user.id = :id AND friend.friend.id = :authUserId)',
        {
          id,
          authUserId,
        },
      )
      .select('friend')
      .getRawOne();

    // Fetch additional data with QueryBuilder
    const detailedUser = await this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.posts', 'posts')
      .leftJoinAndSelect('posts.reactions', 'reactions')
      .leftJoinAndMapMany(
        'user.friends',
        'Friend',
        'allFriends',
        '(allFriends.user.id = :id OR allFriends.friend.id = :id) AND allFriends.status = :status',
        { id, status: 'ACCEPTED' },
      )
      .where('user.id = :id', { id })
      .getOne();

    if (!authUserId || authUserId === id) {
      return {
        ...detailedUser,
      };
    }

    return {
      ...detailedUser,
      friend: friend || null, // Include the friend status if it exists
    };
  }

  async findByEmail(email: string): Promise<User | undefined> {
    return await this.userRepository.findOne({ where: { email } });
  }

  async findByUsername(username: string): Promise<User[]> {
    return await this.userRepository.find({
      where: {
        username: Like(`%${username}%`), // Using LIKE for partial matching
      },
    });
  }

  // New method to update the user's status
  async updateStatus(userId: string, status: string): Promise<User> {
    // Find the user by ID
    const user = await this.userRepository.findOneBy({ id: userId });

    if (!user) {
      throw new Error('User not found'); // Handle appropriately
    }

    // Update the user's status
    user.status = status; // Assuming you have a `status` field in your User entity

    // Save the updated user entity
    await this.userRepository.save(user);

    return user;
  }

  async editUser(id: string, editUserDto: UpdateUserDto): Promise<User> {
    // Find the user by ID
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new Error('User not found'); // Handle appropriately, e.g., using a custom exception
    }

    // Update only the specified fields
    Object.assign(user, editUserDto);

    // Save the updated user entity
    await this.userRepository.save(user);

    return user;
  }

  async remove(id: string): Promise<void> {
    await this.userRepository.delete(id);
  }
}
