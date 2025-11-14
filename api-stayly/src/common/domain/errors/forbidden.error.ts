/**
 * ForbiddenError represents when user is authenticated but lacks required permissions
 * Should be mapped to HTTP 403 Forbidden
 */
import { DomainError } from './domain-error';

export class ForbiddenError extends DomainError {
  constructor(
    message: string = 'Access denied',
    requiredPermission?: string,
    requiredRole?: string,
    metadata?: Record<string, unknown>,
  ) {
    super(message, 'FORBIDDEN', {
      requiredPermission,
      requiredRole,
      ...metadata,
    });
  }
}

