/**
 * HTTP Exception Filter
 * Formats HTTP exceptions for consistent API responses
 */

import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

const extractField = <T extends string>(
  response: unknown,
  field: T,
): string | undefined => {
  if (
    response &&
    typeof response === 'object' &&
    field in response &&
    typeof (response as Record<string, unknown>)[field] === 'string'
  ) {
    return (response as Record<T, string>)[field];
  }
  return undefined;
};

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message:
        typeof exceptionResponse === 'string'
          ? exceptionResponse
          : (extractField(exceptionResponse, 'message') ?? exception.message),
      error: extractField(exceptionResponse, 'error'),
    };

    this.logger.error(
      `${request.method} ${request.url} - ${status} - ${errorResponse.message}`,
    );

    response.status(status).json(errorResponse);
  }
}
