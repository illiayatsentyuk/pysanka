import {
  Post,
  Controller,
  Body,
  HttpCode,
  HttpStatus,
  Get,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto } from './dto';
import { Tokens } from './types';

@Controller('')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Get('/me')
  getMe() {
    return { message: 'Authenticated' };
  }

  @Post('/signup')
  @HttpCode(HttpStatus.CREATED)
  signupLocal(@Body() dto: AuthDto): Promise<Tokens> {
    return this.authService.signupLocal(dto);
  }

  @Post('/signin')
  @HttpCode(HttpStatus.OK)
  signinLocal(@Body() dto: AuthDto): Promise<Tokens> {
    return this.authService.signinLocal(dto);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  logout() {
    return { message: 'Logged out' };
  }

  @Post('/refresh')
  @HttpCode(HttpStatus.OK)
  refreshTokens() {
    return { message: 'Token refresh not needed - all routes are public' };
  }
}
