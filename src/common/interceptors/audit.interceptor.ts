import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { AuditService } from '../../modules/audit/audit.service';
import { RequestUser } from '../types/request-user';

const MUTATING = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private readonly auditService: AuditService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = context.switchToHttp().getRequest<{
      method: string;
      user?: RequestUser;
      headers: Record<string, string | string[] | undefined>;
      ip?: string;
      route?: { path?: string };
      params?: Record<string, string>;
      body?: Record<string, unknown>;
    }>();

    if (!MUTATING.has(req.method)) {
      return next.handle();
    }

    const user = req.user;
    const tenantId = user?.tenantId;
    if (!tenantId) {
      return next.handle();
    }

    return next.handle().pipe(
      tap(() => {
        const path = req.route?.path ?? '';
        const entity = path.split('/').filter(Boolean)[0] ?? 'unknown';
        void this.auditService.log({
          tenantId,
          actorId: user?.id,
          action: req.method,
          entity,
          entityId: req.params?.id,
          metadata: { path, body: req.body },
          ip: req.ip,
          userAgent: req.headers['user-agent'] as string | undefined,
        });
      }),
    );
  }
}
