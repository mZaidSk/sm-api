import { Module } from '@nestjs/common';
import { PostService } from './services/post/post.service';
import { PostController } from './controllers/post/post.controller';
import { MulterModule } from '@nestjs/platform-express';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from './entities/post.entity';
import { ConfigModule as CustomConfig } from 'src/config/config.module';
import * as multer from 'multer';
import { Comment } from './entities/comment.entity';
import { CommentController } from './controllers/comment/comment.controller';
import { CommentService } from './services/comment/comment.service';
import { PostReaction } from './entities/post-reaction.entity';
import { PostReactionController } from './controllers/post-reaction/post-reaction.controller';
import { PostReactionService } from './services/post-reaction/post-reaction.service';
import { UserModule } from '../user/user.module';
// import { ConfigModule as CustomConfig } from './config/config.module';

@Module({
  imports: [
    MulterModule.register({
      storage: multer.memoryStorage(), // Use memory storage for buffer uploads
    }),
    TypeOrmModule.forFeature([Post, PostReaction, Comment]),
    CustomConfig,
    UserModule,
  ],
  controllers: [PostController, CommentController, PostReactionController],
  providers: [PostService, CommentService, PostReactionService],
})
export class PostModule {}
