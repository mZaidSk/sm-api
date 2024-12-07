import { Entity, PrimaryGeneratedColumn, ManyToOne, Column } from 'typeorm';
import { Chat } from './chat.entity';
import { User } from 'src/modules/user/entities/user.entity';

@Entity('messages')
export class Message {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Chat, (chat) => chat.id)
  chat: Chat;

  @ManyToOne(() => User, (user) => user.id)
  sender: User;

  @Column()
  content: string;

  @Column({ type: 'enum', enum: ['TEXT', 'IMAGE', 'VIDEO', 'FILE'] })
  messageType: string;

  @Column({ nullable: true })
  mediaUrl: string;

  @Column({ type: 'timestamp' })
  sentAt: Date;

  @Column({ default: false })
  isDelivered: boolean;

  @Column({ default: false })
  isEdited: boolean;

  @Column({ type: 'timestamp', nullable: true })
  deletedAt: Date;

  @Column({ nullable: true })
  replyToMessageId: string;
}
