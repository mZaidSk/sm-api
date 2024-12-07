import { Injectable } from '@nestjs/common';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './entities/notification.entity';
import { Message } from '../chat/entities/message.entity';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
  ) {}

  async createNotification(
    userId: string,
    message: Message,
  ): Promise<Notification> {
    const notification = this.notificationRepository.create({
      user: { id: userId } as any, // Use `as any` to avoid validation for simplicity

      message: { id: message.id },
      notificationType: 'NEW_MESSAGE', // Default type for this example
      isRead: false,
      createdAt: new Date(),
    });

    return await this.notificationRepository.save(notification);
  }
}
