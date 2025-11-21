/**
 * Port for customer authentication service
 * Defines contract for modules that need customer authentication data
 * This is the abstraction that other modules depend on
 * Following Port/Adapter Pattern - Port is defined in application layer
 */
import { Email } from "../../../../common/domain/value-objects/email.vo";
import { PasswordHash } from "../../../../common/domain/value-objects/password-hash.vo";

/**
 * Customer authentication data required for authentication flow
 * Only exposes necessary fields, not the full Customer entity
 */
export interface CustomerAuthenticationData {
  id: string;
  email: string;
  passwordHash: string;
  isActive: boolean;
}

/**
 * Port interface for customer authentication
 * Other modules depend on this interface, not the implementation
 */
export interface ICustomerAuthenticationPort {
  /**
   * Finds customer by email for authentication purposes
   * Returns only authentication-relevant data, not full entity
   */
  findForAuthentication(
    email: Email,
  ): Promise<CustomerAuthenticationData | null>;

  /**
   * Updates password hash for downstream password reset workflows
   */
  updatePasswordHash(
    customerId: string,
    passwordHash: PasswordHash,
  ): Promise<void>;
}

export const CUSTOMER_AUTHENTICATION_PORT = "CUSTOMER_AUTHENTICATION_PORT";
