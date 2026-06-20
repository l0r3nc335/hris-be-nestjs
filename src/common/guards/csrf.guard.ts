import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { AuthCookiesService } from '../../modules/auth/auth-cookies.service';

const MUTATING_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

@Injectable()
export class CsrfGuard implements CanActivate {
  constructor(private readonly authCookies: AuthCookiesService) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<{ method: string }>();

    if (!MUTATING_METHODS.has(req.method.toUpperCase())) {
      return true;
    }

    if (!this.authCookies.validateCsrf(req as never)) {
      throw new ForbiddenException('Invalid CSRF token');
    }

    return true;
  }
}
