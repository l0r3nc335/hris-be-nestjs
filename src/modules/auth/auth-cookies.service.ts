import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomBytes } from 'crypto';
import type { Request, Response } from 'express';
import type { AuthTokens } from './auth.service';

export const ACCESS_COOKIE = 'hris_access_token';
export const REFRESH_COOKIE = 'hris_refresh_token';
export const CSRF_COOKIE = 'hris_csrf';

const API_PREFIX = '/api/v1';
const AUTH_PREFIX = '/api/v1/auth';

@Injectable()
export class AuthCookiesService {
  constructor(private readonly config: ConfigService) {}

  private isProduction(): boolean {
    return this.config.get<string>('nodeEnv') === 'production';
  }

  private cookieOptions(maxAgeMs: number, path: string, httpOnly: boolean) {
    const sameSite = (this.config.get<string>('cookies.sameSite') ?? 'lax') as
      | 'lax'
      | 'strict'
      | 'none';
    const secure =
      this.config.get<boolean>('cookies.secure') ?? this.isProduction();
    return {
      httpOnly,
      secure,
      sameSite,
      path,
      maxAge: maxAgeMs,
    };
  }

  private accessMaxAgeMs(): number {
    const expires = this.config.get<string>('jwt.accessExpires') ?? '15m';
    return this.parseDurationMs(expires, 15 * 60 * 1000);
  }

  private refreshMaxAgeMs(): number {
    const expires = this.config.get<string>('jwt.refreshExpires') ?? '7d';
    const days = parseInt(expires.replace(/\D/g, ''), 10) || 7;
    return days * 24 * 60 * 60 * 1000;
  }

  private parseDurationMs(value: string, fallback: number): number {
    const match = /^(\d+)(s|m|h|d)$/.exec(value);
    if (!match) return fallback;
    const amount = parseInt(match[1], 10);
    const unit = match[2];
    const multipliers: Record<string, number> = {
      s: 1000,
      m: 60 * 1000,
      h: 60 * 60 * 1000,
      d: 24 * 60 * 60 * 1000,
    };
    return amount * (multipliers[unit] ?? 1000);
  }

  private csrfClearOptions(path: string) {
    const sameSite = (this.config.get<string>('cookies.sameSite') ?? 'lax') as
      | 'lax'
      | 'strict'
      | 'none';
    const secure =
      this.config.get<boolean>('cookies.secure') ?? this.isProduction();
    return { httpOnly: false, secure, sameSite, path };
  }

  private clearLegacyCsrfCookies(res: Response): void {
    res.clearCookie(CSRF_COOKIE, this.csrfClearOptions(API_PREFIX));
  }

  setAuthCookies(res: Response, tokens: AuthTokens): void {
    res.cookie(
      ACCESS_COOKIE,
      tokens.accessToken,
      this.cookieOptions(this.accessMaxAgeMs(), API_PREFIX, true),
    );
    res.cookie(
      REFRESH_COOKIE,
      tokens.refreshToken,
      this.cookieOptions(this.refreshMaxAgeMs(), AUTH_PREFIX, true),
    );
    this.setCsrfCookie(res);
  }

  clearAuthCookies(res: Response): void {
    const sameSite = (this.config.get<string>('cookies.sameSite') ?? 'lax') as
      | 'lax'
      | 'strict'
      | 'none';
    const secure =
      this.config.get<boolean>('cookies.secure') ?? this.isProduction();
    const base = { httpOnly: true, secure, sameSite };
    res.clearCookie(ACCESS_COOKIE, { ...base, path: API_PREFIX });
    res.clearCookie(REFRESH_COOKIE, { ...base, path: AUTH_PREFIX });
    res.clearCookie(CSRF_COOKIE, this.csrfClearOptions('/'));
    this.clearLegacyCsrfCookies(res);
  }

  setCsrfCookie(res: Response): string {
    this.clearLegacyCsrfCookies(res);
    const token = randomBytes(32).toString('hex');
    res.cookie(
      CSRF_COOKIE,
      token,
      this.cookieOptions(24 * 60 * 60 * 1000, '/', false),
    );
    return token;
  }

  readAccessToken(req: Request): string | undefined {
    return req.cookies?.[ACCESS_COOKIE] as string | undefined;
  }

  readRefreshToken(req: Request): string | undefined {
    return req.cookies?.[REFRESH_COOKIE] as string | undefined;
  }

  validateCsrf(req: Request): boolean {
    const cookieToken = req.cookies?.[CSRF_COOKIE] as string | undefined;
    const headerToken = req.headers['x-csrf-token'] as string | undefined;
    if (!cookieToken || !headerToken) return false;
    return cookieToken === headerToken;
  }
}
