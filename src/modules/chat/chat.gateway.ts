import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable } from '@nestjs/common';
import { ChatService } from './services/chat.service';
import { NotificationService } from '../notification/notification.service';
import { MessageService } from './services/message.service';
import { AuthService } from '../auth/auth.service';
import { UserService } from '../user/services/user/user.service';

@WebSocketGateway({ cors: true, namespace: 'chat' })
@Injectable()
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
    private readonly chatService: ChatService,
    private readonly messageService: MessageService,
    private readonly notificationService: NotificationService,
  ) {}

  private userSockets: Map<string, string> = new Map();

  // Handle user connection
  async handleConnection(client: Socket) {
    const userId = this.getUserIdFromSocket(client);
    if (!userId) {
      client.disconnect();
      return;
    }

    await this.userService.updateStatus(userId, 'ACTIVE');
    this.server.emit('userStatusUpdated', { userId, status: 'ACTIVE' });

    // Store the mapping of userId to socketId
    this.userSockets.set(userId, client.id);
  }

  // Handle user disconnection
  async handleDisconnect(client: Socket) {
    const userId = this.getUserIdFromSocket(client);
    if (userId) {
      await this.userService.updateStatus(userId, 'INACTIVE');
      this.server.emit('userStatusUpdated', { userId, status: 'INACTIVE' });

      // Remove the mapping when the user disconnects
      this.userSockets.delete(userId);
    }
  }

  /**
   * Load all chats for the user.
   */
  @SubscribeMessage('loadChats')
  async handleLoadChats(client: Socket) {
    const userId = this.getUserIdFromSocket(client);
    if (!userId) {
      client.disconnect();
      return;
    }

    const chats = await this.chatService.getUserChats(userId);
    client.emit('chatsLoaded', { chats });
  }

  /**
   * Join a chat and fetch old messages.
   */
  @SubscribeMessage('joinChat')
  async handleJoinChat(client: Socket, payload: { chatId: string }) {
    const userId = this.getUserIdFromSocket(client);
    if (!userId) {
      client.disconnect();
      return;
    }

    const messages = await this.messageService.getChatMessages(payload.chatId);

    // console.log(messages);
    // if (messages)
    //   await this.messageService.markMessagesAsSeen(payload.chatId, userId);

    client.join(payload.chatId);
    client.emit('chatJoined', { chatId: payload.chatId, messages });
  }

  /**
   * Leave a chat.
   */
  @SubscribeMessage('leaveChat')
  async handleLeaveChat(client: Socket, payload: { chatId: string }) {
    const userId = this.getUserIdFromSocket(client);
    if (!userId) {
      client.disconnect();
      return;
    }

    client.leave(payload.chatId);
    this.server.emit('userLeftChat', { chatId: payload.chatId, userId });
  }

  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    client: Socket,
    payload: {
      chatId: string;
      content: string;
      messageType: 'TEXT' | 'IMAGE' | 'VIDEO' | 'FILE';
    },
  ) {
    const senderId = this.getUserIdFromSocket(client);
    if (!senderId) {
      client.disconnect();
      return;
    }

    const message = await this.messageService.createMessage({
      ...payload,
      senderId,
    });

    // Notify participants
    const participants = await this.chatService.getChatParticipants(
      payload.chatId,
    );

    console.log(participants);
    participants.forEach(async (participant) => {
      console.log(`Sending message to user with ID: ${participant.user.id}`);

      if (participant.user.id !== senderId) {
        const socketId = this.userSockets.get(participant?.user?.id); // Get the socket ID

        if (socketId) {
          // Send the message using the socket ID
          this.server.to(socketId).emit('receiveMessage', message);
        }

        // Notify offline users
        if (participant.user.status === 'INACTIVE') {
          await this.notificationService.createNotification(
            participant.user.id,
            message,
          );
        }
      }
    });

    client.emit('messageSent', { message });
  }

  private getUserIdFromSocket(client: Socket): string | null {
    const token: string = client.handshake.query.token as string;
    return this.authService.getUserFromToken(token);
  }
}
