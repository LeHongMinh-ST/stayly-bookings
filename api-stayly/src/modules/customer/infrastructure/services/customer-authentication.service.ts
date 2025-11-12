/**
 * CustomerAuthenticationService provides authentication-specific data for other modules
 * This service encapsulates customer authentication logic and exposes only necessary data
 * Following Service Pattern - modules communicate via services, not repositories
 */
import { Inject, Injectable } from '@nestjs/common';
import { Email } from '../../../../common/domain/value-objects/email.vo';
import type { ICustomerRepository } from '../../domain/repositories/customer.repository.interface';
import { CUSTOMER_REPOSITORY } from '../../domain/repositories/customer.repository.interface';

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

@Injectable()
export class CustomerAuthenticationService {
  constructor(
    @Inject(CUSTOMER_REPOSITORY)
    private readonly customerRepository: ICustomerRepository,
  ) {}

  /**
   * Finds customer by email for authentication purposes
   * Returns only authentication-relevant data, not full entity
   * This method is designed to be used by other modules (e.g., auth module)
   */
  async findForAuthentication(email: Email): Promise<CustomerAuthenticationData | null> {
    const customer = await this.customerRepository.findByEmail(email);
    if (!customer) {
      return null;
    }

    return {
      id: customer.getId().getValue(),
      email: customer.getEmail().getValue(),
      passwordHash: customer.getPasswordHash().getValue(),
      isActive: customer.isActive(),
    };
  }
}

export const CUSTOMER_AUTHENTICATION_SERVICE = 'CUSTOMER_AUTHENTICATION_SERVICE';

