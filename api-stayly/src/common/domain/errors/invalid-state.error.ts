/**
 * InvalidStateError represents when an operation cannot be performed due to invalid state
 * Should be mapped to HTTP 400 Bad Request or 422 Unprocessable Entity
 */
import { DomainError } from './domain-error';

export class InvalidStateError extends DomainError {
  constructor(
    message: string,
    currentState?: string,
    requiredState?: string,
    metadata?: Record<string, unknown>,
  ) {
    super(message, 'INVALID_STATE', {
      currentState,
      requiredState,
      ...metadata,
    });
  }
}
