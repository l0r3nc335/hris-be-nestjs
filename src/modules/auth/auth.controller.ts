import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiCookieAuth, ApiTags } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { AuthCookiesService } from './auth-cookies.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RequestUser } from '../../common/types/request-user';

@ApiTags('auth')
@ApiCookieAuth('hris_access_token')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly authCookies: AuthCookiesService,
  ) {}

  @Public()
  @Get('csrf')
  csrf(@Res({ passthrough: true }) res: Response) {
    const csrfToken = this.authCookies.setCsrfCookie(res);
    return { ok: true, csrfToken };
  }

  @Public()
  @Post('login')
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.login(dto);
    this.authCookies.setAuthCookies(res, result.tokens);
    return { user: result.user };
  }

  @Public()
  @Post('refresh-token')
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = this.authCookies.readRefreshToken(req);
    if (!refreshToken) {
      throw new UnauthorizedException('Missing refresh token');
    }
    const tokens = await this.authService.refresh(refreshToken);
    this.authCookies.setAuthCookies(res, tokens);
    return { ok: true };
  }

  @Public()
  @Post('logout')
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const refreshToken = this.authCookies.readRefreshToken(req);
    const accessToken = this.authCookies.readAccessToken(req);
    let userId: string | undefined;
    if (accessToken) {
      try {
        const payload = this.authService.decodeAccessToken(accessToken);
        userId = payload?.sub;
      } catch {
        // Best-effort logout when access token is expired.
      }
    }
    if (userId) {
      await this.authService.logout(userId, refreshToken);
    } else if (refreshToken) {
      await this.authService.logoutByRefreshToken(refreshToken);
    }
    this.authCookies.clearAuthCookies(res);
    return { ok: true };
  }

  @Public()
  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Public()
  @Post('forgot-password')
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto.email);
  }

  @Public()
  @Post('reset-password')
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto.token, dto.password);
  }

  @Public()
  @Post('verify-email')
  verifyEmail(@Body() body: { token: string }) {
    return this.authService.verifyEmail(body.token);
  }

  @Post('resend-verification')
  resendVerification(@CurrentUser() user: RequestUser) {
    return this.authService.resendVerification(user.id);
  }

  @Get('me')
  me(@CurrentUser() user: RequestUser) {
    return this.authService.me(user);
  }

  @Post('change-password')
  changePassword(
    @CurrentUser() user: RequestUser,
    @Body() dto: ChangePasswordDto,
  ) {
    return this.authService.changePassword(
      user.id,
      dto.currentPassword,
      dto.newPassword,
    );
  }
}
