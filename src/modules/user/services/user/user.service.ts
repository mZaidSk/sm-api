import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { User } from '../../entities/user.entity';
import { CreateUserDto } from '../../dto/create-user.dto';
import { UpdateUserDto } from '../../dto/update-user.dto';

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

  async findOne(id: string): Promise<User> {
    return await this.userRepository.findOne({
      where: { id },
      relations: ['posts', 'posts.reactions', 'friends'], // Include 'posts.reactions' for post reactions
    });
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

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    await this.userRepository.update(id, updateUserDto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.userRepository.delete(id);
  }
}
