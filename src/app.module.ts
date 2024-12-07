import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './modules/user/user.module';
import { AuthModule } from './modules/auth/auth.module';
import { ChatModule } from './modules/chat/chat.module';
import { NotificationModule } from './modules/notification/notification.module';
import { User } from './modules/user/entities/user.entity';
import { Chat } from './modules/chat/entities/chat.entity';
import { Message } from './modules/chat/entities/message.entity';
import { MessageReaction } from './modules/chat/entities/messageReaction.entity';
import { MessageStatus } from './modules/chat/entities/messageStatus.entity';
import { Participant } from './modules/chat/entities/participant.entity';
import { Notification } from './modules/notification/entities/notification.entity';
import { Post } from './modules/post/entities/post.entity';
import { PostModule } from './modules/post/post.module';
import { ConfigModule as CustomConfig } from './config/config.module';
import { Friend } from './modules/user/entities/friend.entity';
import { Comment } from './modules/post/entities/comment.entity';
import { PostReaction } from './modules/post/entities/post-reaction.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Makes ConfigModule available throughout the application
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: configService.get<'postgres'>('DB_TYPE'),
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_NAME'),
        entities: [
          User,
          Friend,
          Post,
          PostReaction,
          Comment,
          Chat,
          Message,
          MessageReaction,
          MessageStatus,
          Participant,
          Notification,
        ],
        synchronize: true,
        logging: true,
      }),
      inject: [ConfigService],
    }),
    UserModule,
    AuthModule,
    ChatModule,
    PostModule,
    NotificationModule,
    CustomConfig,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
