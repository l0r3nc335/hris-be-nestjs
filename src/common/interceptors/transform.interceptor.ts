import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, map } from 'rxjs';

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<
  T,
  ApiResponse<T>
> {
  intercept(
    _context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T>> {
    return next.handle().pipe(
      map((data) => {
        if (data === undefined || data === null) {
          return { data: null as T };
        }
        if (
          typeof data === 'object' &&
          data !== null &&
          'data' in (data as Record<string, unknown>) &&
          Object.keys(data as object).length <= 2
        ) {
          return data as ApiResponse<T>;
        }
        return { data: data as T };
      }),
    );
  }
}
