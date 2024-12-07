import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { Participant } from './participant.entity';

@Entity('chats')
export class Chat {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: ['DIRECT', 'GROUP'] })
  chatType: string;

  @Column({ nullable: true })
  chatName: string;

  @Column()
  createdBy: string;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  groupPictureUrl: string;

  @OneToMany(() => Participant, (participant) => participant.chat)
  participants: Participant[];

  @Column({ type: 'timestamp', nullable: true })
  lastMessageAt: Date;
}
