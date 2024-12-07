import { Injectable } from '@nestjs/common';

@Injectable()
export class TokenBlacklistService {
  private blacklist: Set<string> = new Set(); // In-memory blacklist (for simplicity)

  addToken(token: string) {
    this.blacklist.add(token);
  }

  isTokenBlacklisted(token: string): boolean {
    return this.blacklist.has(token);
  }
}
