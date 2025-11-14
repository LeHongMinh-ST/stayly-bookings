/**
 * Application Layer Exception Utilities
 * Provides helper functions for throwing HTTP exceptions in application layer
 * Application layer can throw both domain errors and HTTP exceptions
 */

import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';

/**
 * Throws NotFoundException for entity not found scenarios
 * Use when entity doesn't exist in database/repository
 */
export function throwEntityNotFound(
  entityName: string,
  identifier?: string | Record<string, unknown>,
): never {
  const identifierStr =
    typeof identifier === 'string'
      ? identifier
      : identifier
        ? JSON.stringify(identifier)
        : 'unknown';

  throw new NotFoundException(
    `${entityName} not found${identifier ? ` with identifier: ${identifierStr}` : ''}`,
  );
}

/**
 * Throws BadRequestException for invalid input scenarios
 * Use when input validation fails or business rule is violated
 */
export function throwInvalidInput(message: string, field?: string): never {
  const fullMessage = field ? `${field}: ${message}` : message;
  throw new BadRequestException(fullMessage);
}

/**
 * Throws ConflictException for resource conflict scenarios
 * Use when there's a conflict with current state (duplicate, concurrent modification, etc.)
 */
export function throwConflict(message: string, conflictType?: string): never {
  const fullMessage = conflictType ? `${conflictType}: ${message}` : message;
  throw new ConflictException(fullMessage);
}

/**
 * Throws UnauthorizedException for authentication failures
 * Use when authentication is required but missing or invalid
 */
export function throwUnauthorized(
  message: string = 'Authentication required',
  reason?: string,
): never {
  const fullMessage = reason ? `${message}. Reason: ${reason}` : message;
  throw new UnauthorizedException(fullMessage);
}

/**
 * Throws ForbiddenException for authorization failures
 * Use when user is authenticated but lacks required permissions
 */
export function throwForbidden(
  message: string = 'Access denied',
  requiredPermission?: string,
  requiredRole?: string,
): never {
  const details = [
    requiredPermission && `permission=${requiredPermission}`,
    requiredRole && `role=${requiredRole}`,
  ]
    .filter(Boolean)
    .join(', ');
  const fullMessage = details ? `${message} (${details})` : message;
  throw new ForbiddenException(fullMessage);
}

/**
 * Throws UnprocessableEntityException for invalid operation scenarios
 * Use when operation cannot be performed due to business logic constraints
 */
export function throwInvalidOperation(
  message: string,
  operation?: string,
  reason?: string,
): never {
  const details = [
    operation && `operation=${operation}`,
    reason && `reason=${reason}`,
  ]
    .filter(Boolean)
    .join(', ');
  const fullMessage = details ? `${message} (${details})` : message;
  throw new UnprocessableEntityException(fullMessage);
}

/**
 * Throws InternalServerErrorException for unexpected errors
 * Use as last resort when error cannot be categorized
 */
export function throwInternalError(
  message: string = 'An unexpected error occurred',
  originalError?: Error,
): never {
  if (originalError) {
    throw new InternalServerErrorException({
      message,
      originalError: originalError.message,
    });
  }
  throw new InternalServerErrorException(message);
}

/**
 * Validates entity exists, throws NotFoundException if not
 * Returns the entity if found
 */
export function ensureEntityExists<T>(
  entity: T | null | undefined,
  entityName: string,
  identifier?: string | Record<string, unknown>,
): T {
  if (!entity) {
    throwEntityNotFound(entityName, identifier);
  }
  return entity;
}

/**
 * Validates condition, throws BadRequestException if false
 */
export function ensureCondition(
  condition: boolean,
  message: string,
  field?: string,
): asserts condition {
  if (!condition) {
    throwInvalidInput(message, field);
  }
}

/**
 * Validates no conflict, throws ConflictException if conflict exists
 */
export function ensureNoConflict(
  condition: boolean,
  message: string,
  conflictType?: string,
): asserts condition {
  if (!condition) {
    throwConflict(message, conflictType);
  }
}
