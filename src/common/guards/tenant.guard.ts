import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AppException, ErrorCodes } from '../errors/app.exception';
import { HttpStatus } from '@nestjs/common';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { SKIP_TENANT_KEY } from '../decorators/skip-tenant.decorator';
import { RequestUser } from '../types/request-user';

@Injectable()
export class TenantGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const skipTenant = this.reflector.getAllAndOverride<boolean>(
      SKIP_TENANT_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (skipTenant) return true;

    const req = context.switchToHttp().getRequest<{
      user?: RequestUser;
      headers: Record<string, string | undefined>;
    }>();
    const user = req.user;
    if (!user) return true;

    const headerTenant = req.headers['x-tenant-id'];
    if (
      headerTenant &&
      headerTenant !== user.tenantId &&
      user.role !== 'superadmin'
    ) {
      throw new AppException(
        ErrorCodes.TENANT_MISMATCH,
        'Tenant header does not match authenticated tenant',
        HttpStatus.FORBIDDEN,
      );
    }
    return true;
  }
}
