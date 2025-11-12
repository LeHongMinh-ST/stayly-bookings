/**
 * ICustomerAuthenticationService provides authentication-specific contract for customer lookup
 * This interface abstracts customer service dependency from customer-management module
 * Following Adapter Pattern to decouple auth module from customer-management domain
 */
import { Email } from '../../../../common/domain/value-objects/email.vo';

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

export interface ICustomerAuthenticationService {
  /**
   * Finds customer by email for authentication purposes
   * Returns only authentication-relevant data, not full entity
   */
  findForAuthentication(email: Email): Promise<CustomerAuthenticationData | null>;
}

export const CUSTOMER_AUTHENTICATION_SERVICE = 'CUSTOMER_AUTHENTICATION_SERVICE';

