/**
 * DomainErrorMapper
 * Maps domain errors to HTTP exceptions according to conventions
 */
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  HttpException,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';
import {
  ConflictError,
  DomainError,
  ForbiddenError,
  InvalidInputError,
  InvalidOperationError,
  InvalidStateError,
  NotFoundError,
  UnauthorizedError,
} from './index';

/**
 * Maps a domain error to the appropriate HTTP exception
 * @param error - The domain error to map
 * @returns The corresponding HTTP exception
 */
export function mapDomainErrorToHttpException(
  error: DomainError,
): HttpException {
  if (error instanceof NotFoundError) {
    return new NotFoundException(error.message);
  }

  if (error instanceof InvalidInputError) {
    return new BadRequestException(error.message);
  }

  if (error instanceof InvalidStateError) {
    return new BadRequestException(error.message);
  }

  if (error instanceof ConflictError) {
    return new ConflictException(error.message);
  }

  if (error instanceof UnauthorizedError) {
    return new UnauthorizedException(error.message);
  }

  if (error instanceof ForbiddenError) {
    return new ForbiddenException(error.message);
  }

  if (error instanceof InvalidOperationError) {
    return new UnprocessableEntityException(error.message);
  }

  // Unknown domain error - map to internal server error
  return new InternalServerErrorException(
    `Unhandled domain error: ${error.message}`,
  );
}

/**
 * Gets the HTTP status code for a domain error
 * @param error - The domain error
 * @returns The HTTP status code
 */
export function getHttpStatusFromDomainError(error: DomainError): number {
  if (error instanceof NotFoundError) return 404;
  if (error instanceof InvalidInputError) return 400;
  if (error instanceof InvalidStateError) return 400;
  if (error instanceof ConflictError) return 409;
  if (error instanceof UnauthorizedError) return 401;
  if (error instanceof ForbiddenError) return 403;
  if (error instanceof InvalidOperationError) return 422;
  return 500;
}
