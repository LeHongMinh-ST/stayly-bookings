/**
 * ConflictError represents when there is a conflict with the current state of a resource
 * Should be mapped to HTTP 409 Conflict
 * Examples: duplicate resource, concurrent modification, optimistic locking failure
 */
import { DomainError } from "./domain-error";

export class ConflictError extends DomainError {
  constructor(
    message: string,
    conflictType?: string,
    conflictingValue?: unknown,
    metadata?: Record<string, unknown>,
  ) {
    super(message, "CONFLICT", {
      conflictType,
      conflictingValue,
      ...metadata,
    });
  }
}
