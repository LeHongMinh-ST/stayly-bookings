/**
 * Logging Interceptor
 * Logs all HTTP requests and responses
 */

import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { tap } from "rxjs/operators";
import type { Request, Response } from "express";

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<Request>();
    const { method, url, ip } = request;
    const now = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          const response = context.switchToHttp().getResponse<Response>();
          const { statusCode } = response;
          const delay = Date.now() - now;

          this.logger.log(
            `${method} ${url} ${statusCode} - ${delay}ms - ${ip}`,
          );
        },
        error: (error: unknown) => {
          const delay = Date.now() - now;
          const status =
            typeof error === "object" && error !== null && "status" in error
              ? ((error as { status?: number }).status ?? 500)
              : 500;
          const message =
            error instanceof Error ? error.message : JSON.stringify(error);
          this.logger.error(
            `${method} ${url} ${status} - ${delay}ms - ${ip} - ${message}`,
          );
        },
      }),
    );
  }
}
