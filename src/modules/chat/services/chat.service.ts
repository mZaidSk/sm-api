import { Injectable } from '@nestjs/common';
import { CreateChatDto } from '../dto/create-chat.dto';
import { UpdateChatDto } from '../dto/update-chat.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Chat } from '../entities/chat.entity';
import { Repository } from 'typeorm';
import { Participant } from '../entities/participant.entity';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Chat)
    private chatRepository: Repository<Chat>,
    @InjectRepository(Participant)
    private participantRepository: Repository<Participant>,
  ) {}

  async create(createChatDto: CreateChatDto): Promise<Chat> {
    const {
      chatType,
      participants,
      chatName,
      description,
      groupPictureUrl,
      createdBy,
    } = createChatDto;

    if (chatType === 'DIRECT') {
      // Check if a direct chat between these two participants already exists
      const existingChat = await this.chatRepository
        .createQueryBuilder('chat')
        .innerJoin(
          'chat.participants',
          'participant1',
          'participant1.userId = :user1',
          { user1: participants[0] },
        )
        .innerJoin(
          'chat.participants',
          'participant2',
          'participant2.userId = :user2',
          { user2: participants[1] },
        )
        .where('chat.chatType = :type', { type: 'DIRECT' })
        .getOne();

      if (existingChat) {
        return existingChat;
      }

      // Create a new direct chat
      const newChat = this.chatRepository.create({
        chatType,
        createdBy,
      });
      const savedChat = await this.chatRepository.save(newChat);

      // Add participants
      const participantEntities = participants.map((userId) => {
        return this.participantRepository.create({
          chat: savedChat,
          user: { id: userId }, // Assuming `User` has an `id` property
          joinedAt: new Date(),
        });
      });
      await this.participantRepository.save(participantEntities);

      return savedChat;
    } else if (chatType === 'GROUP') {
      // Create a new group chat
      const newChat = this.chatRepository.create({
        chatType,
        chatName,
        description,
        groupPictureUrl,
        createdBy,
      });
      const savedChat = await this.chatRepository.save(newChat);

      // Add participants
      const participantEntities = participants.map((userId) => {
        return this.participantRepository.create({
          chat: savedChat,
          user: { id: userId }, // Assuming `User` has an `id` property
          joinedAt: new Date(),
        });
      });
      await this.participantRepository.save(participantEntities);

      return savedChat;
    } else {
      throw new Error('Invalid chat type. Must be either DIRECT or GROUP.');
    }
  }

  async getUserChats(userId: string): Promise<any[]> {
    // Find all participant records for the user
    const participantRecords = await this.participantRepository.find({
      where: { user: { id: userId } },
      relations: ['chat', 'chat.participants', 'chat.participants.user'], // Load related data
    });

    // Process each chat to include relevant details
    const chats = participantRecords.map((participant) => {
      const chat = participant.chat;

      // For direct chats, include details of the other user
      if (chat.chatType === 'DIRECT') {
        const otherParticipant = chat.participants.find(
          (p) => p.user.id !== userId,
        );

        return {
          ...chat,
          otherUser: otherParticipant ? otherParticipant.user : null, // Add other user's details
        };
      }

      // For group chats, return the chat as-is
      return chat;
    });

    return chats;
  }

  async getChatParticipants(chatId: string): Promise<Participant[]> {
    const participants = await this.participantRepository.find({
      where: { chat: { id: chatId } },
      relations: ['user'], // Assuming 'user' is a related entity in 'Participant'
    });

    // Return the list of participants for the given chat
    return participants;
  }

  async findChatWithParticipants(chatId: string): Promise<Chat> {
    const chat = await this.chatRepository.findOne({
      where: { id: chatId },
      relations: ['participants', 'participants.user'], // Assuming `user` is related to `Participant`
    });

    if (!chat) {
      throw new Error('Chat not found');
    }

    return chat;
  }

  update(id: number, updateChatDto: UpdateChatDto) {
    return `This action updates a #${id} chat`;
  }

  remove(id: number) {
    return `This action removes a #${id} chat`;
  }
}
