import { ChatService } from './chat.service';
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from '../entities/message.entity';
import { MessageStatus } from '../entities/messageStatus.entity';
import { ParticipantsService } from './participants.service';

@Injectable()
export class MessageService {
  constructor(
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
    @InjectRepository(MessageStatus)
    private readonly messageStatusRepository: Repository<MessageStatus>,

    private readonly chatService: ChatService,
  ) {}

  async createMessage(payload: {
    chatId: string;
    senderId: string;
    content: string;
    messageType: 'TEXT' | 'IMAGE' | 'VIDEO' | 'FILE';
    mediaUrl?: string;
  }): Promise<Message> {
    const { chatId, senderId, content, messageType, mediaUrl } = payload;

    // Validate payload
    if (!chatId || !senderId || !content || !messageType) {
      throw new BadRequestException('Invalid message payload.');
    }

    // 1. Save the message to the database
    const message = this.messageRepository.create({
      chat: { id: chatId }, // Ensure relations are correctly set up in the entity
      sender: { id: senderId }, // Assuming `sender` is a relation to User
      content,
      messageType,
      mediaUrl: mediaUrl || null,
      sentAt: new Date(),
      isDelivered: false,
      isEdited: false,
    });

    const savedMessage = await this.messageRepository.save(message);

    // 2. Get chat participants
    const participants = await this.chatService.getChatParticipants(chatId);

    if (!participants || participants.length === 0) {
      throw new NotFoundException('No participants found for the chat.');
    }

    // 3. Create message status entries for each participant
    const messageStatuses = participants.map((participant) =>
      this.messageStatusRepository.create({
        message: savedMessage,
        user: { id: participant.user.id }, // Assuming `user` is a relation
        status: participant.user.id === senderId ? 'SEEN' : 'SENT',
        seenAt: participant.user.id === senderId ? new Date() : null,
      }),
    );

    await this.messageStatusRepository.save(messageStatuses);

    // 4. Return the created message
    return savedMessage;
  }

  async getChatMessages(chatId: string): Promise<Message[]> {
    // Ensure the chat exists and fetch messages
    const messages = await this.messageRepository.find({
      where: { chat: { id: chatId }, deletedAt: null },
      order: { sentAt: 'ASC' }, // Sort messages by sent time
      relations: ['sender'], // Load sender if needed
    });

    if (!messages) {
      throw new NotFoundException(`No messages found for chat ID ${chatId}`);
    }

    return messages;
  }

  async getUnreadMessages(chatId: string, userId: string): Promise<Message[]> {
    // Step 1: Find all unread message statuses for the given chat and user
    const unreadStatuses = await this.messageStatusRepository.find({
      where: {
        user: { id: userId }, // Assuming 'user' is a relation in the entity
        message: { chat: { id: chatId } }, // Filter messages by chat ID
        status: 'SENT', // Only messages with status 'SENT' are considered unread
      },
      relations: ['message'], // Load the associated message
    });

    // Step 2: Extract and return the unread messages
    const unreadMessages = unreadStatuses.map((status) => status.message);

    return unreadMessages;
  }

  async markMessagesAsSeen(chatId: string, userId: string): Promise<void> {
    // 1. Find message statuses to update
    const statusesToUpdate = await this.messageStatusRepository
      .createQueryBuilder('status')
      .innerJoin('status.message', 'message')
      .where('message.chatId = :chatId', { chatId })
      .andWhere('status.userId = :userId', { userId })
      .andWhere('status.status = :status', { status: 'SENT' })
      .getMany();

    if (!statusesToUpdate.length) {
      throw new NotFoundException('No delivered messages found to update.');
    }

    // 2. Update statuses
    for (const status of statusesToUpdate) {
      status.status = 'SEEN';
      status.seenAt = new Date();
    }

    await this.messageStatusRepository.save(statusesToUpdate);
  }
}
