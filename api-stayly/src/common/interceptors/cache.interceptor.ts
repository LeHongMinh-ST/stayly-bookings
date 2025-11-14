/**
 * Cache Interceptor
 * Caches HTTP responses based on request URL
 */

import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject } from '@nestjs/common';
import type { Cache } from 'cache-manager';
import type { Request } from 'express';

@Injectable()
export class CacheInterceptor implements NestInterceptor {
  private readonly ttlMs = 300_000;

  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<unknown>> {
    const request = context.switchToHttp().getRequest<Request>();
    const { method, url } = request;

    // Only cache GET requests
    if (method !== 'GET') {
      return next.handle();
    }

    const cacheKey = `http:${method}:${url}`;
    const cachedResponse = await this.cacheManager.get<unknown>(cacheKey);

    if (typeof cachedResponse !== 'undefined') {
      return of(cachedResponse);
    }

    return next.handle().pipe(
      tap((data) => {
        void this.cacheManager.set(cacheKey, data, this.ttlMs);
      }),
    );
  }
}
