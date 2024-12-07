import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { PostReactionService } from '../../services/post-reaction/post-reaction.service';
import { CreatePostReactionDto } from '../../dto/post-reaction/post-reaction.dto';
import { PostReaction } from '../../entities/post-reaction.entity';
import { JwtAuthGuard } from 'src/modules/auth/gurds/auth.guard';

@Controller('post-reactions')
@UseGuards(JwtAuthGuard)
export class PostReactionController {
  constructor(private readonly postReactionService: PostReactionService) {}

  @Post()
  async createPostReaction(
    @Body() createPostReactionDto: CreatePostReactionDto,
    @Request() req: any,
  ): Promise<PostReaction> {
    const userId = req.userId;
    return this.postReactionService.createPostReaction(
      createPostReactionDto,
      userId,
    );
  }

  @Delete(':postId')
  async removePostReaction(
    @Param('postId') postId: string,
    @Request() req: any,
  ): Promise<void> {
    const userId = req.userId;
    return this.postReactionService.removePostReaction(postId, userId);
  }

  @Get(':postId')
  async getPostReactions(
    @Param('postId') postId: string,
  ): Promise<PostReaction[]> {
    return this.postReactionService.getPostReactions(postId);
  }
}
