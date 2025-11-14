/**
 * NotFoundError represents when an entity or resource is not found
 * Should be mapped to HTTP 404 Not Found
 */
import { DomainError } from './domain-error';

export class NotFoundError extends DomainError {
  constructor(
    entityName: string,
    identifier?: string | Record<string, unknown>,
    metadata?: Record<string, unknown>,
  ) {
    const identifierStr =
      typeof identifier === 'string'
        ? identifier
        : identifier
          ? JSON.stringify(identifier)
          : 'unknown';

    super(
      `${entityName} not found${identifier ? ` with identifier: ${identifierStr}` : ''}`,
      'NOT_FOUND',
      {
        entityName,
        identifier,
        ...metadata,
      },
    );
  }
}
