import { Module } from '@nestjs/common';
import { ChatService } from './services/chat.service';
import { ChatController } from './chat.controller';
import { ChatGateway } from './chat.gateway';
import { UserModule } from '../user/user.module';
import { NotificationModule } from '../notification/notification.module';
import { MessageService } from './services/message.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Chat } from './entities/chat.entity';
import { Message } from './entities/message.entity';
import { MessageReaction } from './entities/messageReaction.entity';
import { MessageStatus } from './entities/messageStatus.entity';
import { Participant } from './entities/participant.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    UserModule,
    AuthModule,
    NotificationModule,
    TypeOrmModule.forFeature([
      Chat,
      Message,
      MessageReaction,
      MessageStatus,
      Participant,
    ]),
  ],
  controllers: [ChatController],
  providers: [ChatService, ChatGateway, MessageService],
})
export class ChatModule {}
