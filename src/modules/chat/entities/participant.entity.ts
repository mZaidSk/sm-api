import { Entity, PrimaryGeneratedColumn, ManyToOne, Column } from 'typeorm';
import { Chat } from './chat.entity';
import { User } from 'src/modules/user/entities/user.entity';

@Entity('participants')
export class Participant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Chat, (chat) => chat.id)
  chat: Chat;

  @ManyToOne(() => User, (user) => user.id)
  user: User;

  @Column({ default: false })
  isAdmin: boolean;

  @Column({ type: 'int', default: 0 })
  unreadMessageCount: number;

  @Column({ type: 'timestamp' })
  joinedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  removedAt: Date;
}
