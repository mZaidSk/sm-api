import { Module } from '@nestjs/common';
import { UserController } from './controllers/user/user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UserService } from './services/user/user.service';
import { Friend } from './entities/friend.entity';
import { FriendController } from './controllers/friend/friend.controller';
import { FriendService } from './services/friend/friend.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, Friend])],
  controllers: [UserController, FriendController],
  providers: [UserService, FriendService],
  exports: [UserService],
})
export class UserModule {}
