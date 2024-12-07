import { User } from 'src/modules/user/entities/user.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { Comment } from './comment.entity';
import { PostReaction } from './post-reaction.entity';

@Entity()
export class Post {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.posts, { eager: true })
  user: User;

  @OneToMany(() => Comment, (comment) => comment.post)
  comments: Comment[];

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'text', nullable: true })
  mediaUrl: string;

  @Column({ type: 'enum', enum: ['TEXT', 'IMAGE', 'VIDEO', 'LINK'] })
  postType: string;

  @Column('simple-array', { nullable: true })
  tags: string[];

  @Column({
    type: 'enum',
    enum: ['PUBLIC', 'FRIENDS', 'PRIVATE'],
    default: 'PUBLIC',
  })
  visibility: string;

  @Column({ type: 'uuid', nullable: true })
  sharedPostId: string;

  @Column({ type: 'jsonb', default: { LIKE: 0, LOVE: 0, LAUGH: 0 } })
  reactionCounts: Record<string, number>;

  @OneToMany(() => PostReaction, (reaction) => reaction.post)
  reactions: PostReaction[];

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;

  @Column({ type: 'boolean', default: false })
  isDeleted: boolean;
}
