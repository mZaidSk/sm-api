import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { TokenBlacklistService } from '../token-blacklist/token-blacklist.service';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(
    private readonly blacklistService: TokenBlacklistService, // Inject blacklist service
  ) {
    super();
  }

  // Override canActivate method to add custom logic
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = request.headers.authorization?.split(' ')[1];

    // Check if the token is blacklisted
    // if (token && (await this.blacklistService.isTokenBlacklisted(token))) {
    //   throw new UnauthorizedException('Token has been revoked');
    // }

    // Proceed with default AuthGuard logic (validates the token and attaches user to request)
    const isValid = (await super.canActivate(context)) as boolean;

    if (isValid) {
      // Attach token and userId to the request object
      const user = request.user; // Populated by Passport strategy

      if (user) {
        request.userId = user; // Attach userId to request
        request.token = token; // Attach token to request
      }
    }

    return isValid;
  }

  // Override handleRequest to customize the response on failed authentication
  handleRequest(err, user, info) {
    if (err || !user) {
      throw err || new UnauthorizedException('Unauthorized access');
    }
    return user;
  }
}
