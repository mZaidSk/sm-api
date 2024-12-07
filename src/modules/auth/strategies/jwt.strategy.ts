import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { ExtractJwt, StrategyOptions } from 'passport-jwt';
import { UserService } from 'src/modules/user/services/user/user.service';

// Define JwtPayload interface
interface JwtPayload {
  email: string;
  userId: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly userService: UserService) {
    const options: StrategyOptions = {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET, // Ensure JWT_SECRET is set in your environment
    };
    super(options);
  }

  // Validate the JWT payload and return the user
  async validate(payload: JwtPayload) {
    const { userId } = payload;
    return userId; // Attach user info to request.user
  }
}
