/**
 * IUserAuthenticationService provides authentication-specific contract for user lookup
 * This interface abstracts user service dependency from user module
 * Following Adapter Pattern to decouple auth module from user domain
 */
import { Email } from '../../../../common/domain/value-objects/email.vo';

/**
 * User authentication data required for authentication flow
 * Only exposes necessary fields, not the full User entity
 */
export interface UserAuthenticationData {
  id: string;
  email: string;
  passwordHash: string;
  isActive: boolean;
  roles: string[];
  permissions: string[];
}

export interface IUserAuthenticationService {
  /**
   * Finds user by email for authentication purposes
   * Returns only authentication-relevant data, not full entity
   */
  findForAuthentication(email: Email): Promise<UserAuthenticationData | null>;
}

export const USER_AUTHENTICATION_SERVICE = 'USER_AUTHENTICATION_SERVICE';

