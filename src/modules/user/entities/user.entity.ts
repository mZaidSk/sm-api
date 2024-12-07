import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { Friend } from './friend.entity';
import { Post } from 'src/modules/post/entities/post.entity';
import { Comment } from 'src/modules/post/entities/comment.entity';
import { PostReaction } from 'src/modules/post/entities/post-reaction.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  username: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ unique: true })
  email: string;

  @Column({ unique: true })
  phoneNo: string;

  @Column()
  gender: string;

  @Column('date')
  dob: Date;

  @Column()
  password: string;

  @Column({ nullable: true })
  profilePictureUrl: string;

  @OneToMany(() => Friend, (friend) => friend.user)
  friends: Friend[];

  @OneToMany(() => Post, (post) => post.user) // Match the 'user' field in the Post entity
  posts: Post[];

  @OneToMany(() => PostReaction, (reaction) => reaction.user)
  reactions: PostReaction[];

  @OneToMany(() => Comment, (comment) => comment)
  comments: Comment[];

  @Column({ nullable: true, type: 'timestamp' })
  lastActiveAt: Date;

  @Column({ default: 'Active' })
  status: string;

  @CreateDateColumn()
  createdAt: Date;

  @CreateDateColumn()
  updatedAt: Date;
}
