import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from '../../entities/post.entity';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
    @Inject('CLOUDINARY') private readonly cloudinary,
  ) {}

  async createPost(postData: Partial<Post>): Promise<Post> {
    const post = this.postRepository.create(postData);
    return this.postRepository.save(post);
  }

  async findOne(postId: string) {
    return this.postRepository.findOne({ where: { id: postId } });
  }

  async uploadMedia(file: Express.Multer.File): Promise<string> {
    try {
      const uploadResult: any = await new Promise((resolve, reject) => {
        this.cloudinary.uploader
          .upload_stream(
            { resource_type: 'auto', folder: 'social_media_posts' },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            },
          )
          .end(file.buffer);
      });
      return uploadResult.secure_url;
    } catch (error) {
      console.error('Error uploading to Cloudinary:', error);
      throw new Error('Failed to upload media');
    }
  }

  async getPosts(): Promise<Post[]> {
    return this.postRepository.find({
      relations: ['user', 'reactions'], // Include the related user and reactions data
    });
  }

  async deletePost(id: string): Promise<void> {
    const post = await this.postRepository.findOne({ where: { id } });
    if (!post) {
      throw new Error('Post not found');
    }

    await this.postRepository.remove(post);
  }

  async getUserPosts(userId: string, postType?: string): Promise<Post[]> {
    const queryBuilder = this.postRepository.createQueryBuilder('post');

    queryBuilder
      .leftJoinAndSelect('post.user', 'user') // Include user data
      .leftJoinAndSelect('post.reactions', 'reaction'); // Include reactions data

    queryBuilder.where('post.userId = :userId', { userId });

    if (postType) {
      queryBuilder.andWhere('post.postType = :postType', { postType });
    }

    return queryBuilder.getMany();
  }

  async getRandomPosts(count: number): Promise<Post[]> {
    // Fetch posts with related user data directly
    const allPosts = await this.postRepository.find({
      relations: ['user', 'reactions'], // Include user data
    });

    // Shuffle the posts array and return `count` number of posts
    const shuffled = allPosts.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }
}
