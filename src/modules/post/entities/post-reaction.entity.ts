import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';
import { Post } from './post.entity';
import { User } from 'src/modules/user/entities/user.entity';

@Entity('post_reactions')
export class PostReaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Post, (post) => post.reactions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'postId' })
  post: Post;

  @Column({ type: 'uuid' })
  userId: string;

  @ManyToOne(() => User, (user) => user.reactions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({
    type: 'enum',
    enum: ['LIKE', 'LOVE', 'LAUGH'],
  })
  reaction: 'LIKE' | 'LOVE' | 'LAUGH'; // Defining the possible reactions

  @CreateDateColumn()
  reactedAt: Date;
}
