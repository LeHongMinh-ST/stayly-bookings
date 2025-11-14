/**
 * InvalidOperationError represents when an operation cannot be performed
 * due to business logic constraints
 * Should be mapped to HTTP 422 Unprocessable Entity
 */
import { DomainError } from "./domain-error";

export class InvalidOperationError extends DomainError {
  constructor(
    message: string,
    operation?: string,
    reason?: string,
    metadata?: Record<string, unknown>,
  ) {
    super(message, "INVALID_OPERATION", {
      operation,
      reason,
      ...metadata,
    });
  }
}
