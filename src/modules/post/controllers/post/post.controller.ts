import {
  Controller,
  Get,
  Post,
  Body,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Query,
  UseGuards,
  Req,
  Request,
  Param,
} from '@nestjs/common';
import { PostService } from '../../services/post/post.service';
import { CreatePostDto } from '../../dto/create-post.dto';
// import { UpdatePostDto } from '../../dto/update-post.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { Post as Pt } from '../../entities/post.entity';
import { JwtAuthGuard } from 'src/modules/auth/gurds/auth.guard';

@Controller('post')
@UseGuards(JwtAuthGuard)
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file')) // 'media' is the field name for file in form-data
  async createPost(
    @Body() postData: CreatePostDto,
    @Request() req: any, // Access the request object
    @UploadedFile() file?: Express.Multer.File,
  ): Promise<Pt> {
    const userId = req.userId; // Extract userId from JWT payload

    let mediaUrl: string | null = null;

    // If media is provided, upload it to Cloudinary
    if (file) {
      try {
        mediaUrl = await this.postService.uploadMedia(file);
      } catch (error) {
        throw new BadRequestException('Failed to upload media');
      }
    }

    // Create the post with the uploaded media URL
    const newPost = await this.postService.createPost({
      ...postData,
      user: userId, // Attach userId to the post
      mediaUrl,
      postType: mediaUrl
        ? file.mimetype.startsWith('image/')
          ? 'IMAGE'
          : 'VIDEO'
        : 'TEXT',
    });

    return newPost;
  }

  // Get user posts
  @Get('user')
  async getUserPosts(
    @Query('type') type: string | undefined,
    @Request() req: any, // Access the request object
  ): Promise<Pt[]> {
    const userId = req.userId; // Extract userId from JWT payload
    return this.postService.getUserPosts(userId, type);
  }

  @Get('user/:userId')
  async getSomeOtherUserPosts(
    @Param('userId') userId: string,
    @Query('type') type: string | undefined,
  ): Promise<Pt[]> {
    return this.postService.getUserPosts(userId, type);
  }

  // Feed
  @Get('random')
  async getRandomFeed(@Query('count') count: string): Promise<Pt[]> {
    const num = parseInt(count, 10) || 10; // Default to 10 posts if count is not specified
    return this.postService.getRandomPosts(num);
  }
}
