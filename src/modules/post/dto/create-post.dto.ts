import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  IsArray,
  IsBoolean,
  ValidateNested,
} from 'class-validator';

export class CreatePostDto {
  @IsUUID()
  @IsNotEmpty()
  userId: string; // Assuming user ID will be provided to link the post to a user

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsString()
  @IsOptional()
  mediaUrl?: string;

  @IsEnum(['TEXT', 'IMAGE', 'VIDEO', 'LINK'])
  @IsNotEmpty()
  postType: 'TEXT' | 'IMAGE' | 'VIDEO' | 'LINK';

  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  tags?: string[];

  @IsEnum(['PUBLIC', 'FRIENDS', 'PRIVATE'])
  @IsOptional()
  visibility?: 'PUBLIC' | 'FRIENDS' | 'PRIVATE';

  @IsUUID()
  @IsOptional()
  sharedPostId?: string;

  @IsOptional()
  reactionCounts?: Record<string, number>; // Assuming this might be handled by default in the backend.

  @IsBoolean()
  @IsOptional()
  isDeleted?: boolean;
}
