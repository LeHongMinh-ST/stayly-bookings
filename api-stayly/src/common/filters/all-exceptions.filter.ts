/**
 * All Exceptions Filter
 * Catches all unhandled exceptions including domain errors
 */

import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { DomainError } from '../domain/errors';
import { mapDomainErrorToHttpException } from '../domain/errors/domain-error-mapper';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let httpException: HttpException;
    let status: number;
    let message: string | object;

    // Handle domain errors - map to HTTP exceptions
    if (exception instanceof DomainError) {
      httpException = mapDomainErrorToHttpException(exception);
      status = httpException.getStatus();
      const exceptionResponse = httpException.getResponse();
      message =
        typeof exceptionResponse === 'string'
          ? exceptionResponse
          : (exceptionResponse as any).message || exception.message;

      // Log domain error with context
      this.logger.warn(
        `Domain error: ${exception.name} - ${exception.message}`,
        {
          code: exception.code,
          metadata: exception.metadata,
          path: request.url,
          method: request.method,
        },
      );
    }
    // Handle HTTP exceptions
    else if (exception instanceof HttpException) {
      httpException = exception;
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      message =
        typeof exceptionResponse === 'string'
          ? exceptionResponse
          : (exceptionResponse as any).message || exception.message;
    }
    // Handle unknown errors
    else {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = 'Internal server error';

      // Log unexpected errors with full stack trace
      this.logger.error(
        `Unexpected error: ${exception instanceof Error ? exception.message : String(exception)}`,
        exception instanceof Error ? exception.stack : undefined,
        {
          path: request.url,
          method: request.method,
        },
      );
    }

    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message:
        typeof message === 'string'
          ? message
          : (message as any).message || 'Internal server error',
    };

    response.status(status).json(errorResponse);
  }
}
