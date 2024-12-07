import { IsNotEmpty, IsOptional, IsUUID, IsString } from 'class-validator';

export class CreateCommentDTO {
  @IsUUID()
  @IsNotEmpty()
  postId: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsUUID()
  @IsOptional()
  parentCommentId?: string;
}
