import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from '../../entities/comment.entity';
import { CreateCommentDTO } from '../../dto/comment/create-comment.dto';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
  ) {}

  async create(
    commentData: CreateCommentDTO,
    userId: string,
  ): Promise<Comment> {
    const comment = this.commentRepository.create({ ...commentData, userId });
    return this.commentRepository.save(comment);
  }

  async delete(id: string): Promise<void> {
    await this.commentRepository.softDelete(id);
  }

  async findByPostId(postId: string): Promise<Comment[]> {
    return this.commentRepository.find({
      where: { postId },
      order: { createdAt: 'ASC' },
      relations: ['user'],
    });
  }
}
