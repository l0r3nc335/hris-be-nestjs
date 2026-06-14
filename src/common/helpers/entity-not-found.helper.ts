import { HttpStatus, Injectable } from '@nestjs/common';
import { AppException, ErrorCodes } from '../errors/app.exception';

@Injectable()
export class EntityNotFoundHelper {
  throwNotFound(entity: string): never {
    throw new AppException(
      ErrorCodes.NOT_FOUND,
      `${entity} not found`,
      HttpStatus.NOT_FOUND,
    );
  }

  parsePersonName(name: string): { firstName: string; lastName: string } {
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) {
      return { firstName: parts[0], lastName: '' };
    }
    return {
      firstName: parts[0],
      lastName: parts.slice(1).join(' '),
    };
  }
}
