import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('friends')
export class Friend {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.friends, { onDelete: 'CASCADE' })
  user: User;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  friend: User;

  @Column({ type: 'uuid' })
  initiatedBy: string;

  @Column({
    type: 'enum',
    enum: ['PENDING', 'ACCEPTED', 'BLOCKED'],
    default: 'PENDING',
  })
  status: string;

  @Column({ type: 'varchar', nullable: true })
  blockedReason: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
