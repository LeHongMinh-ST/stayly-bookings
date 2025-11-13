/**
 * CurrentUser decorator extracts authenticated user from request
 * Works with Passport JWT strategies that attach user to request
 * Supports both User (admin/staff) and Customer types
 *
 * Usage:
 * - @CurrentUser() user: CurrentUserPayload - Get full user payload (union type)
 * - @CurrentUser('id') userId: string - Get specific property
 * - Use type guards: isUser() or isCustomer() to narrow types
 */
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Base payload structure shared by both user and customer
 */
interface BaseUserPayload {
  id: string;
  email: string;
  roles: string[];
  permissions: string[];
}

/**
 * User (admin/staff) payload from JWT token
 * Returned by JwtUserStrategy when using JwtUserGuard
 */
export interface CurrentUserPayload extends BaseUserPayload {
  userType: 'user';
  roles: string[]; // Admin roles: SUPER_ADMIN, OWNER, MANAGER, STAFF
  permissions: string[]; // Admin permissions
}

/**
 * Customer payload from JWT token
 * Returned by JwtCustomerStrategy when using JwtCustomerGuard
 */
export interface CurrentCustomerPayload extends BaseUserPayload {
  userType: 'customer';
  roles: ['customer']; // Always ['customer']
  permissions: []; // Usually empty for customers
}

/**
 * Union type for current authenticated user
 * Can be either User (admin/staff) or Customer
 */
export type CurrentAuthPayload = CurrentUserPayload | CurrentCustomerPayload;

/**
 * Type guard to check if payload is User (admin/staff)
 *
 * @param payload - Current auth payload
 * @returns True if payload is User type
 *
 * @example
 * const user = @CurrentUser();
 * if (isUser(user)) {
 *   // user is CurrentUserPayload, has roles and permissions
 *   console.log(user.roles, user.permissions);
 * }
 */
export function isUser(
  payload: CurrentAuthPayload | null,
): payload is CurrentUserPayload {
  return payload !== null && payload.userType === 'user';
}

/**
 * Type guard to check if payload is Customer
 *
 * @param payload - Current auth payload
 * @returns True if payload is Customer type
 *
 * @example
 * const user = @CurrentUser();
 * if (isCustomer(user)) {
 *   // user is CurrentCustomerPayload
 *   console.log(user.id);
 * }
 */
export function isCustomer(
  payload: CurrentAuthPayload | null,
): payload is CurrentCustomerPayload {
  return payload !== null && payload.userType === 'customer';
}

/**
 * Decorator to extract current authenticated user from request
 * Works with both JwtUserGuard and JwtCustomerGuard
 *
 * @param data - Optional property key to extract specific field
 * @param ctx - Execution context from NestJS
 * @returns User payload or specific property if data is provided
 *
 * @example
 * // Get full user object (union type)
 * async handler(@CurrentUser() user: CurrentAuthPayload) {
 *   if (isUser(user)) {
 *     // TypeScript knows user is CurrentUserPayload
 *     console.log(user.roles, user.permissions);
 *   }
 * }
 *
 * @example
 * // Get specific property (works for both types)
 * async handler(@CurrentUser('id') userId: string) {
 *   // userId is string for both user and customer
 * }
 *
 * @example
 * // Type-safe usage with guards
 * @UseGuards(JwtUserGuard)
 * async handler(@CurrentUser() user: CurrentUserPayload) {
 *   // TypeScript knows it's user, not customer
 *   // But you should still use isUser() for runtime safety
 * }
 */
export const CurrentUser = createParamDecorator(
  (
    data: keyof CurrentAuthPayload | undefined,
    ctx: ExecutionContext,
  ): CurrentAuthPayload | string | null => {
    const request = ctx
      .switchToHttp()
      .getRequest<{ user?: CurrentAuthPayload }>();
    const user = request.user;

    if (!user) {
      return null;
    }

    // If specific property requested, return only that
    if (data) {
      return user[data] as string;
    }

    // Return full user object
    return user;
  },
);
