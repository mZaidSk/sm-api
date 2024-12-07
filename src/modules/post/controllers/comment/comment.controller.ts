import {
  Controller,
  Post,
  Param,
  Body,
  Delete,
  Get,
  UseGuards,
  Request,
} from '@nestjs/common';
import { CommentService } from '../../services/comment/comment.service';
import { CreateCommentDTO } from '../../dto/comment/create-comment.dto';
import { Comment } from '../../entities/comment.entity';
import { JwtAuthGuard } from 'src/modules/auth/gurds/auth.guard';

@Controller('comments')
@UseGuards(JwtAuthGuard)
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Get('post/:postId')
  async findByPostId(@Param('postId') postId: string): Promise<Comment[]> {
    return this.commentService.findByPostId(postId);
  }

  @Post()
  async create(
    @Body() commentData: CreateCommentDTO,
    @Request() req: any,
  ): Promise<Comment> {
    const userId = req.userId;
    return this.commentService.create(commentData, userId);
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<void> {
    await this.commentService.delete(id);
  }
}
