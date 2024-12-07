import { Entity, PrimaryGeneratedColumn, ManyToOne, Column } from 'typeorm';
import { Message } from './message.entity';
import { User } from 'src/modules/user/entities/user.entity';

@Entity('message_reactions')
export class MessageReaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Message, (message) => message.id)
  message: Message;

  @ManyToOne(() => User, (user) => user.id)
  user: User;

  @Column({ type: 'enum', enum: ['LIKE', 'LOVE', 'LAUGH', 'SAD', 'ANGRY'] })
  reaction: string;

  @Column({ type: 'timestamp' })
  reactedAt: Date;
}
