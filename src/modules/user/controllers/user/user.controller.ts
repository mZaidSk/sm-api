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
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { UserService } from '../../services/user/user.service';
import { CreateUserDto } from '../../dto/create-user.dto';
import { UpdateUserDto } from '../../dto/update-user.dto';
import { JwtAuthGuard } from 'src/modules/auth/gurds/auth.guard';
import { ResponseHelper } from 'src/utils/response.helper';

@Controller('user')
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    try {
      const user = await this.userService.create(createUserDto);
      return ResponseHelper.success('User created successfully', user);
    } catch (error) {
      throw new HttpException(
        ResponseHelper.error('Failed to create user', error.message),
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get()
  async findAll() {
    try {
      const users = await this.userService.findAll();
      return ResponseHelper.success('Users fetched successfully', users);
    } catch (error) {
      throw new HttpException(
        ResponseHelper.error('Failed to fetch users', error.message),
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get('search')
  async searchByUsername(@Query('username') username: string) {
    try {
      const user = await this.userService.findByUsername(username);
      return ResponseHelper.success('User fetched successfully', user);
    } catch (error) {
      throw new HttpException(
        ResponseHelper.error('Failed to search user', error.message),
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get('me')
  async getUser(@Request() req: any) {
    try {
      const userId = req.userId;
      const user = await this.userService.findOne(userId);
      return ResponseHelper.success('User data fetched successfully', user);
    } catch (error) {
      throw new HttpException(
        ResponseHelper.error('Failed to fetch user data', error.message),
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req: any) {
    try {
      const userId = req.userId;
      const user = await this.userService.findOne(id, userId);
      return ResponseHelper.success('User fetched successfully', user);
    } catch (error) {
      throw new HttpException(
        ResponseHelper.error('Failed to fetch user', error.message),
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Patch(':id')
  async editUser(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    try {
      const user = await this.userService.editUser(id, updateUserDto);
      return ResponseHelper.success('User updated successfully', user);
    } catch (error) {
      throw new HttpException(
        ResponseHelper.error('Failed to update user', error.message),
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    try {
      await this.userService.remove(id);
      return ResponseHelper.success('User deleted successfully');
    } catch (error) {
      throw new HttpException(
        ResponseHelper.error('Failed to delete user', error.message),
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
