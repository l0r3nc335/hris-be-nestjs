import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { createHash, randomBytes } from 'crypto';
import { HttpStatus } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { AppException, ErrorCodes } from '../../common/errors/app.exception';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { RequestUser } from '../../common/types/request-user';
import { Inject } from '@nestjs/common';
import { REDIS_CLIENT } from '../../cache/redis.module';
import Redis from 'ioredis';

interface JwtPayload {
  sub: string;
  tenantId: string;
  email: string;
  role: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface UserResponse {
  id: string;
  tenantId: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  permissions: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
  ) {}

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  private async getUserPermissions(
    userId: string,
    role: string,
  ): Promise<string[]> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        userRoles: {
          include: {
            role: {
              include: {
                rolePermissions: { include: { permission: true } },
              },
            },
          },
        },
      },
    });
    if (!user) return [];

    const permissions = new Set<string>();
    for (const ur of user.userRoles) {
      for (const rp of ur.role.rolePermissions) {
        permissions.add(rp.permission.code);
      }
    }
    if (role === 'admin') {
      const all = await this.prisma.permission.findMany();
      all.forEach((p) => permissions.add(p.code));
    }
    return Array.from(permissions);
  }

  private toUserResponse(
    user: {
      id: string;
      tenantId: string;
      email: string;
      firstName: string;
      lastName: string;
      role: string;
      isActive: boolean;
      createdAt: Date;
      updatedAt: Date;
    },
    permissions: string[],
  ): UserResponse {
    return {
      id: user.id,
      tenantId: user.tenantId,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      permissions,
      isActive: user.isActive,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };
  }

  async login(
    dto: LoginDto,
  ): Promise<{ user: UserResponse; tokens: AuthTokens }> {
    const user = await this.prisma.user.findFirst({
      where: { email: dto.email.toLowerCase() },
    });

    if (!user || !(await bcrypt.compare(dto.password, user.passwordHash))) {
      throw new AppException(
        ErrorCodes.AUTH_INVALID_CREDENTIALS,
        'Invalid email or password',
        HttpStatus.UNAUTHORIZED,
      );
    }

    if (!user.isActive) {
      throw new AppException(
        ErrorCodes.AUTH_FORBIDDEN,
        'Account is deactivated',
        HttpStatus.FORBIDDEN,
      );
    }

    const tenant = await this.prisma.tenant.findUnique({
      where: { id: user.tenantId },
    });
    if (tenant?.status === 'suspended') {
      throw new AppException(
        ErrorCodes.TENANT_SUSPENDED,
        'Tenant is suspended',
        HttpStatus.FORBIDDEN,
      );
    }

    const permissions = await this.getUserPermissions(user.id, user.role);
    const tokens = await this.issueTokens(
      user.id,
      user.tenantId,
      user.email,
      user.role,
    );

    return {
      user: this.toUserResponse(user, permissions),
      tokens,
    };
  }

  async issueTokens(
    userId: string,
    tenantId: string,
    email: string,
    role: string,
  ): Promise<AuthTokens> {
    const payload = { sub: userId, tenantId, email, role };
    const accessToken = this.jwt.sign(payload, {
      secret:
        this.config.get<string>('jwt.accessSecret') ??
        'dev-access-secret-change-in-production',
      expiresIn: (this.config.get<string>('jwt.accessExpires') ??
        '15m') as `${number}${'s' | 'm' | 'h' | 'd'}`,
    });

    const refreshToken = randomBytes(48).toString('hex');
    const tokenHash = this.hashToken(refreshToken);
    const expiresIn = this.config.get<string>('jwt.refreshExpires') ?? '7d';
    const days = parseInt(expiresIn.replace(/\D/g, ''), 10) || 7;
    const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);

    await this.prisma.refreshToken.create({
      data: { userId, tokenHash, expiresAt },
    });

    return { accessToken, refreshToken };
  }

  async refresh(refreshToken: string): Promise<AuthTokens> {
    const tokenHash = this.hashToken(refreshToken);
    const stored = await this.prisma.refreshToken.findFirst({
      where: { tokenHash, revokedAt: null },
      include: { user: true },
    });

    if (!stored || stored.expiresAt < new Date()) {
      throw new AppException(
        ErrorCodes.AUTH_TOKEN_EXPIRED,
        'Invalid or expired refresh token',
        HttpStatus.UNAUTHORIZED,
      );
    }

    await this.prisma.refreshToken.update({
      where: { id: stored.id },
      data: { revokedAt: new Date() },
    });

    return this.issueTokens(
      stored.user.id,
      stored.user.tenantId,
      stored.user.email,
      stored.user.role,
    );
  }

  async logout(userId: string, refreshToken?: string): Promise<void> {
    if (refreshToken) {
      const tokenHash = this.hashToken(refreshToken);
      await this.prisma.refreshToken.updateMany({
        where: { userId, tokenHash, revokedAt: null },
        data: { revokedAt: new Date() },
      });
    } else {
      await this.prisma.refreshToken.updateMany({
        where: { userId, revokedAt: null },
        data: { revokedAt: new Date() },
      });
    }
    await this.redis.set(
      `session:revoked:${userId}`,
      Date.now().toString(),
      'EX',
      86400,
    );
  }

  async logoutByRefreshToken(refreshToken: string): Promise<void> {
    const tokenHash = this.hashToken(refreshToken);
    const stored = await this.prisma.refreshToken.findFirst({
      where: { tokenHash, revokedAt: null },
    });
    if (stored) {
      await this.logout(stored.userId, refreshToken);
    }
  }

  decodeAccessToken(accessToken: string): JwtPayload | null {
    try {
      return this.jwt.verify<JwtPayload>(accessToken, {
        secret:
          this.config.get<string>('jwt.accessSecret') ??
          'dev-access-secret-change-in-production',
      });
    } catch {
      return null;
    }
  }

  async me(user: RequestUser): Promise<UserResponse> {
    const dbUser = await this.prisma.user.findUnique({
      where: { id: user.id },
    });
    if (!dbUser) {
      throw new AppException(
        ErrorCodes.NOT_FOUND,
        'User not found',
        HttpStatus.NOT_FOUND,
      );
    }
    const permissions = await this.getUserPermissions(dbUser.id, dbUser.role);
    return this.toUserResponse(dbUser, permissions);
  }

  async register(dto: RegisterDto): Promise<UserResponse> {
    const tenant = await this.prisma.tenant.findFirst({
      where: { status: 'active' },
    });
    if (!tenant) {
      throw new AppException(
        ErrorCodes.INTERNAL_ERROR,
        'No active tenant available for registration',
        HttpStatus.BAD_REQUEST,
      );
    }

    const existing = await this.prisma.user.findFirst({
      where: { tenantId: tenant.id, email: dto.email.toLowerCase() },
    });
    if (existing) {
      throw new AppException(
        ErrorCodes.VALIDATION_ERROR,
        'Email already registered',
        HttpStatus.CONFLICT,
      );
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.create({
      data: {
        tenantId: tenant.id,
        email: dto.email.toLowerCase(),
        passwordHash,
        firstName: dto.firstName,
        lastName: dto.lastName,
        role: 'user',
      },
    });

    const permissions = await this.getUserPermissions(user.id, user.role);
    return this.toUserResponse(user, permissions);
  }

  forgotPassword(email: string): void {
    void email;
    // Stub: would enqueue email job
  }

  resetPassword(token: string, password: string): void {
    void token;
    void password;
    // Stub: token validation not implemented
  }

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<void> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || !(await bcrypt.compare(currentPassword, user.passwordHash))) {
      throw new AppException(
        ErrorCodes.AUTH_INVALID_CREDENTIALS,
        'Current password is incorrect',
        HttpStatus.UNAUTHORIZED,
      );
    }
    const passwordHash = await bcrypt.hash(newPassword, 10);
    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });
  }

  verifyEmail(token: string): void {
    void token;
  }

  resendVerification(userId: string): void {
    void userId;
  }
}
