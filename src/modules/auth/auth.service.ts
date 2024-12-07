import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { LoginAuthDto } from './dto/login-auth.dto';
import { TokenBlacklistService } from './token-blacklist/token-blacklist.service';
import { UserService } from '../user/services/user/user.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly blacklistService: TokenBlacklistService,
  ) {}

  // Register a new user
  async register(createAuthDto: CreateAuthDto) {
    // Hash the password before saving the user
    const hashedPassword = await bcrypt.hash(createAuthDto.password, 10);
    const newUser = {
      ...createAuthDto,
      password: hashedPassword, // Store hashed password
    };

    // Call UserService to create the user
    const user = await this.userService.create(newUser);

    // Generate JWT token for the user
    const payload = { userId: user.id, email: user.email };
    const token = this.jwtService.sign(payload);

    return {
      message: 'User registered successfully',
      token, // Return the generated token
    };
  }

  // Login the user and return a JWT token
  async login(loginAuthDto: LoginAuthDto) {
    // Validate user credentials (find user by email)
    const user = await this.userService.findByEmail(loginAuthDto.email);

    if (!user) {
      throw new Error('Invalid credentials'); // Handle error appropriately
    }

    // Compare the password
    const isPasswordValid = await bcrypt.compare(
      loginAuthDto.password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    // Generate JWT token for the logged-in user
    const payload = { userId: user.id, email: user.email };
    const token = this.jwtService.sign(payload);

    return {
      message: 'Login successful',
      user,
      token,
    };
  }

  async logout(token: string) {
    this.blacklistService.addToken(token);
    return {
      message: 'Logout successfully!',
    };
  }

  async checkUser(id: string) {
    // Fetch the user by ID
    const user = await this.userService.findOne(id);

    if (!user) {
      throw new Error('User not found'); // Handle appropriately
    }

    // Exclude the password field from the user object
    const { password, ...userWithoutPassword } = user;

    return userWithoutPassword;
  }

  validateToken(token: any): any {
    try {
      return this.jwtService.verify(token); // Decodes and verifies the token
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }

  getUserFromToken(token: string): string {
    const decoded = this.validateToken(token);
    if (!decoded?.userId) {
      throw new UnauthorizedException('User ID not found in token');
    }
    return decoded.userId;
  }
}
