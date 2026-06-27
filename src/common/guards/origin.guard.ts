import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

type RequestHeaders = Record<string, string | string[] | undefined>;

function headerValue(
  headers: RequestHeaders,
  name: string,
): string | undefined {
  const value = headers[name];
  if (Array.isArray(value)) {
    return value[0];
  }
  return value;
}

function resolveRequestOrigin(headers: RequestHeaders): string | null {
  const origin = headerValue(headers, 'origin');
  if (origin) {
    return origin;
  }

  const referer = headerValue(headers, 'referer');
  if (!referer) {
    return null;
  }

  try {
    return new URL(referer).origin;
  } catch {
    return null;
  }
}

@Injectable()
export class OriginGuard implements CanActivate {
  constructor(private readonly config: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<{ headers: RequestHeaders }>();
    const allowed = this.config.get<string[]>('corsOrigins') ?? [];
    const requestOrigin = resolveRequestOrigin(req.headers);

    if (!requestOrigin) {
      return true;
    }

    if (allowed.includes(requestOrigin)) {
      return true;
    }

    throw new ForbiddenException('Origin not allowed');
  }
}
