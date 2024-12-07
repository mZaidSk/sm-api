import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { UserService } from '../../services/user/user.service';
import { CreateUserDto } from '../../dto/create-user.dto';
import { UpdateUserDto } from '../../dto/update-user.dto';
import { JwtAuthGuard } from 'src/modules/auth/gurds/auth.guard';

@Controller('user')
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Get()
  findAll() {
    return this.userService.findAll();
  }

  @Get('search')
  async searchByUsername(@Query('username') username: string) {
    console.log(username);
    return await this.userService.findByUsername(username);
  }

  @Get('me')
  async getUser(@Request() req: any) {
    const userId = req.userId;
    return await this.userService.findOne(userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(id);
  }
}
