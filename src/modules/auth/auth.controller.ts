import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
// import { JwtAuthGuard } from './guards/jwt-auth.guard'; // Assuming you're using JWT for authentication
import { LoginAuthDto } from './dto/login-auth.dto';
import { JwtAuthGuard } from './gurds/auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // Register a new user
  @Post('register')
  async register(@Body() createAuthDto: CreateAuthDto) {
    return await this.authService.register(createAuthDto);
  }

  // Login user
  @Post('login')
  async login(@Body() loginAuthDto: LoginAuthDto) {
    return await this.authService.login(loginAuthDto);
  }

  @Get('logout')
  @UseGuards(JwtAuthGuard)
  async logout(@Request() req: any) {
    return await this.authService.logout(req.token);
  }

  // Get current authenticated user
  @Get('check-user')
  @UseGuards(JwtAuthGuard) // Protect route with a JWT Guard
  async getCurrentUser(@Request() req: any) {
    return await this.authService.checkUser(req.userId);
  }

  // @Get('test')
  // @UseGuards(JwtAuthGuard) // Protect route with a JWT Guard
  // async testApi(@Query() token: { token: string }) {
  //   return await this.authService.getUserFromToken(token);
  // }
}
