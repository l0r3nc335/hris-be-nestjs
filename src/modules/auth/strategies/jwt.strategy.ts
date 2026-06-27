import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import type { Request } from 'express';
import { PrismaService } from '../../../database/prisma.service';
import { RequestUser } from '../../../common/types/request-user';
import {
  ACCESS_COOKIE,
} from '../auth-cookies.service';

export interface JwtPayload {
  sub: string;
  tenantId: string;
  email: string;
  role: string;
}

function extractAccessToken(req: Request): string | null {
  const cookieToken = req.cookies?.[ACCESS_COOKIE] as string | undefined;
  return cookieToken ?? null;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    config: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: extractAccessToken,
      ignoreExpiration: false,
      secretOrKey:
        config.get<string>('jwt.accessSecret') ??
        'dev-access-secret-change-in-production',
    });
  }

  async validate(payload: JwtPayload): Promise<RequestUser> {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
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

    if (!user || !user.isActive) {
      throw new UnauthorizedException();
    }

    const permissions = new Set<string>();
    for (const ur of user.userRoles) {
      for (const rp of ur.role.rolePermissions) {
        permissions.add(rp.permission.code);
      }
    }

    if (user.role === 'superadmin') {
      const allPerms = await this.prisma.permission.findMany();
      allPerms.forEach((p) => permissions.add(p.code));
    }

    return {
      id: user.id,
      tenantId: user.tenantId,
      email: user.email,
      role: user.role,
      permissions: Array.from(permissions),
      isActive: user.isActive,
    };
  }
}
