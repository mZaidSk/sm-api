import { Injectable } from '@nestjs/common';
import { PostReaction } from '../../entities/post-reaction.entity';
import { CreatePostReactionDto } from '../../dto/post-reaction/post-reaction.dto';
import { PostService } from '../post/post.service';
import { UserService } from 'src/modules/user/services/user/user.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class PostReactionService {
  constructor(
    private readonly postService: PostService,
    private readonly userService: UserService,
    @InjectRepository(PostReaction)
    private readonly postReactionRepository: Repository<PostReaction>,
  ) {}

  async createPostReaction(
    createPostReactionDto: CreatePostReactionDto,
    userId: string,
  ): Promise<PostReaction> {
    const { postId, reaction } = createPostReactionDto;

    // Use PostService to find the post
    const post = await this.postService.findOne(postId);
    if (!post) {
      throw new Error('Post not found');
    }

    // Use UserService to find the user
    const user = await this.userService.findOne(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Check if the user has already reacted to the post
    const existingReaction = await this.postReactionRepository.findOne({
      where: { post: { id: postId }, user: { id: userId } },
    });

    if (existingReaction) {
      // If the reaction exists, return it instead of creating a new one
      return existingReaction;
    }

    // Create a new reaction
    const postReaction = this.postReactionRepository.create({
      post,
      userId,
      user,
      reaction,
      reactedAt: new Date(),
    });

    return this.postReactionRepository.save(postReaction);
  }

  async removePostReaction(postId: string, userId: string): Promise<void> {
    // Find the user's reaction to the post
    const existingReaction = await this.postReactionRepository.findOne({
      where: { post: { id: postId }, user: { id: userId } },
    });

    if (existingReaction) {
      // If a reaction exists, delete it
      await this.postReactionRepository.remove(existingReaction);
    } else {
      throw new Error('Reaction not found');
    }
  }

  async getPostReactions(postId: string): Promise<PostReaction[]> {
    return this.postReactionRepository.find({
      where: { post: { id: postId } },
      relations: ['post', 'user'],
    });
  }
}
