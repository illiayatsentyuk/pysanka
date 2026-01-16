import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AuthDto } from './dto';
import { Tokens } from './types';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
  ) {}

  async signupLocal(dto: AuthDto): Promise<Tokens> {
    // Database removed - authentication not needed
    const tokens = await this.getTokens(1, dto.email, {});
    return tokens;
  }

  async signinLocal(dto: AuthDto): Promise<Tokens> {
    // Database removed - authentication not needed
    const tokens = await this.getTokens(1, dto.email, {});
    return tokens;
  }

  async logout(userId: number) {
    // Database removed - no action needed
    return { message: 'Logged out' };
  }

  async refreshTokens(userId: number, rt: string) {
    // Database removed - authentication not needed
    const tokens = await this.getTokens(userId, 'user@example.com', {});
    return tokens;
  }

  hashData(data: string) {
    return bcrypt.hash(data, 10);
  }

  async getTokens(
    userId: number,
    email: string,
    results?: any,
  ): Promise<Tokens> {
    const [at, rt] = await Promise.all([
      this.jwtService.signAsync(
        {
          sub: userId,
          email,
          results: results || {},
        },
        {
          secret: 'at-secret',
          expiresIn: 60 * 15,
        },
      ),
      this.jwtService.signAsync(
        {
          sub: userId,
          email,
          results: results || {},
        },
        {
          secret: 'rt-secret',
          expiresIn: 60 * 60 * 24 * 7,
        },
      ),
    ]);
    return {
      access_token: at,
      refresh_token: rt,
    };
  }

  async updateRtHash(userId: number, rt: string) {
    // Database removed - no action needed
  }
}
