/**
 * UnauthorizedError represents when authentication fails
 * Should be mapped to HTTP 401 Unauthorized
 */
import { DomainError } from './domain-error';

export class UnauthorizedError extends DomainError {
  constructor(
    message: string = 'Authentication required',
    reason?: string,
    metadata?: Record<string, unknown>,
  ) {
    super(message, 'UNAUTHORIZED', {
      reason,
      ...metadata,
    });
  }
}


