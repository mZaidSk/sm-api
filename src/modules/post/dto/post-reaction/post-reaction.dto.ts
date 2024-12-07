import { IsEnum, IsNotEmpty, IsUUID } from 'class-validator';

export class CreatePostReactionDto {
  @IsUUID()
  @IsNotEmpty()
  postId: string;

  @IsEnum(['LIKE', 'LOVE', 'LAUGH'])
  @IsNotEmpty()
  reaction: 'LIKE' | 'LOVE' | 'LAUGH';
}
