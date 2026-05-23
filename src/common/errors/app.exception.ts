import { HttpException, HttpStatus } from '@nestjs/common';

export class AppException extends HttpException {
  constructor(
    public readonly code: string,
    message: string,
    status: HttpStatus = HttpStatus.BAD_REQUEST,
    public readonly details?: Record<string, string[]>,
  ) {
    super({ code, message, status, details }, status);
  }
}

export const ErrorCodes = {
  AUTH_INVALID_CREDENTIALS: 'AUTH_001',
  AUTH_UNAUTHORIZED: 'AUTH_002',
  AUTH_TOKEN_EXPIRED: 'AUTH_003',
  AUTH_FORBIDDEN: 'AUTH_004',
  TENANT_MISMATCH: 'TENANT_001',
  TENANT_SUSPENDED: 'TENANT_002',
  NOT_FOUND: 'NOT_FOUND',
  VALIDATION_ERROR: 'VALIDATION_001',
  INTERNAL_ERROR: 'INTERNAL_001',
} as const;
