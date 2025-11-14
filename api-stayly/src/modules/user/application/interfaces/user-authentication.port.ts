/**
 * Port for user authentication service
 * Defines contract for modules that need user authentication data
 * This is the abstraction that other modules depend on
 * Following Port/Adapter Pattern - Port is defined in application layer
 */
import { Email } from "../../../../common/domain/value-objects/email.vo";

/**
 * User authentication data required for authentication flow
 * Only exposes necessary fields, not the full User entity
 * Note: Roles and permissions are queried separately from RBAC module
 */
export interface UserAuthenticationData {
  id: string;
  email: string;
  passwordHash: string;
  isActive: boolean;
}

/**
 * Port interface for user authentication
 * Other modules depend on this interface, not the implementation
 */
export interface IUserAuthenticationPort {
  /**
   * Finds user by email for authentication purposes
   * Returns only authentication-relevant data, not full entity
   */
  findForAuthentication(email: Email): Promise<UserAuthenticationData | null>;
}

export const USER_AUTHENTICATION_PORT = "USER_AUTHENTICATION_PORT";
