import { Entity, PrimaryGeneratedColumn, ManyToOne, Column } from 'typeorm';
import { Message } from './message.entity';
import { User } from 'src/modules/user/entities/user.entity';

@Entity('message_statuses')
export class MessageStatus {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Message, (message) => message.id)
  message: Message;

  @ManyToOne(() => User, (user) => user.id)
  user: User;

  @Column({ type: 'enum', enum: ['SENT', 'DELIVERED', 'SEEN'] })
  status: string;

  @Column({ type: 'timestamp', nullable: true })
  seenAt: Date;
}
