import { Chat } from 'src/modules/chat/entities/chat.entity';
import { Message } from 'src/modules/chat/entities/message.entity';
import { User } from 'src/modules/user/entities/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.id)
  user: User;

  @ManyToOne(() => Chat, (chat) => chat.id, { nullable: true })
  chat: Chat;

  @ManyToOne(() => Message, (message) => message.id, { nullable: true })
  message: Message;

  @Column({ type: 'enum', enum: ['NEW_MESSAGE', 'USER_JOINED', 'USER_LEFT'] })
  notificationType: string;

  @Column({ default: false })
  isRead: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
