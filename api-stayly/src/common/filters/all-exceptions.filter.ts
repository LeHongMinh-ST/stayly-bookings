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
} from "@nestjs/common";
import { Request, Response } from "express";
import { DomainError } from "../domain/errors";
import { mapDomainErrorToHttpException } from "../domain/errors/domain-error-mapper";

const resolveResponseMessage = (
  response: unknown,
  fallback: string,
): string => {
  if (typeof response === "string") {
    return response;
  }
  if (
    response &&
    typeof response === "object" &&
    "message" in response &&
    typeof (response as { message?: unknown }).message === "string"
  ) {
    return (response as { message: string }).message;
  }
  return fallback;
};

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status: number;
    let message: string;

    // Handle domain errors - map to HTTP exceptions
    if (exception instanceof DomainError) {
      const httpException = mapDomainErrorToHttpException(exception);
      status = httpException.getStatus();
      const exceptionResponse = httpException.getResponse();
      message = resolveResponseMessage(exceptionResponse, exception.message);

      // Log domain error with context
      const contextPayload = JSON.stringify({
        code: exception.code,
        metadata: exception.metadata,
        path: request.url,
        method: request.method,
      });
      this.logger.warn(
        `Domain error: ${exception.name} - ${exception.message}`,
        contextPayload,
      );
    }
    // Handle HTTP exceptions
    else if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      message = resolveResponseMessage(exceptionResponse, exception.message);
    }
    // Handle unknown errors
    else {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = "Internal server error";

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
      message,
    };

    response.status(status).json(errorResponse);
  }
}
