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

  /**
   * Handle user connection.
   */
  async handleConnection(client: Socket) {
    const userId = this.getUserIdFromSocket(client);
    if (!userId) {
      client.disconnect();
      return;
    }

    await this.userService.updateStatus(userId, 'ACTIVE');
    this.server.emit('userStatusUpdated', { userId, status: 'ACTIVE' });
  }

  /**
   * Handle user disconnection.
   */
  async handleDisconnect(client: Socket) {
    const userId = this.getUserIdFromSocket(client);
    if (userId) {
      await this.userService.updateStatus(userId, 'INACTIVE');
      this.server.emit('userStatusUpdated', { userId, status: 'INACTIVE' });
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

  /**
   * Send a message to a chat.
   */
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
    participants.forEach(async (participant) => {
      if (participant.user.id !== senderId) {
        this.server.to(participant.user.id).emit('receiveMessage', message);

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

  /**
   * Receive unread messages.
   */
  @SubscribeMessage('receiveMessage')
  async handleReceiveMessage(client: Socket, payload: { chatId: string }) {
    const userId = this.getUserIdFromSocket(client);
    if (!userId) {
      client.disconnect();
      return;
    }

    const messages = await this.messageService.getUnreadMessages(
      payload.chatId,
      userId,
    );
    client.emit('messagesReceived', { chatId: payload.chatId, messages });
  }

  /**
   * Extract the user ID from the WebSocket connection.
   */
  private getUserIdFromSocket(client: Socket): string | null {
    const token: string = client.handshake.query.token as string;
    return this.authService.getUserFromToken(token);
  }
}
