import {
  Controller,
  Post,
  Body,
  Param,
  Get,
  Patch,
  UseGuards,
  Request,
} from '@nestjs/common';
import { FriendService } from '../../services/friend/friend.service';
import { JwtAuthGuard } from 'src/modules/auth/gurds/auth.guard';

@Controller('friend')
@UseGuards(JwtAuthGuard)
export class FriendController {
  constructor(private readonly friendService: FriendService) {}

  @Post('send-request/:friendId')
  async sendFriendRequest(
    @Param('friendId') friendId: string,
    @Request() req: any,
  ) {
    const userId = req.userId;
    return this.friendService.sendFriendRequest(userId, friendId);
  }

  @Patch('accept-request/:friendId')
  async acceptFriendRequest(
    @Param('friendId') friendId: string,
    @Request() req: any,
  ) {
    const userId = req.userId;
    return this.friendService.acceptFriendRequest(userId, friendId);
  }

  @Patch('block/:friendId')
  async blockUser(
    @Param('friendId') friendId: string,
    @Body('reason') reason: string,
    @Request() req: any,
  ) {
    const userId = req.userId;
    return this.friendService.blockUser(userId, friendId, reason);
  }

  @Get('list')
  async listFriends(@Request() req: any) {
    const userId = req.userId;
    return this.friendService.listFriends(userId);
  }

  @Get('pending-requests')
  async listPendingRequests(@Request() req: any) {
    const userId = req.userId;
    return this.friendService.listPendingRequests(userId);
  }

  @Get('suggest-friends')
  async suggestFriendsRequest(@Request() req: any) {
    const userId = req.userId;
    return this.friendService.suggestFriends(userId);
  }
}
