/**
 * CustomerAuthenticationService provides authentication-specific data for other modules
 * This service implements ICustomerAuthenticationPort and encapsulates customer authentication logic
 * Following Port/Adapter Pattern - service implements port defined in application layer
 */
import { Inject, Injectable } from '@nestjs/common';
import { Email } from '../../../../common/domain/value-objects/email.vo';
import type { ICustomerRepository } from '../../domain/repositories/customer.repository.interface';
import { CUSTOMER_REPOSITORY } from '../../domain/repositories/customer.repository.interface';
import type {
  ICustomerAuthenticationPort,
  CustomerAuthenticationData,
} from '../../application/interfaces/customer-authentication.port';

@Injectable()
export class CustomerAuthenticationService
  implements ICustomerAuthenticationPort
{
  constructor(
    @Inject(CUSTOMER_REPOSITORY)
    private readonly customerRepository: ICustomerRepository,
  ) {}

  /**
   * Finds customer by email for authentication purposes
   * Returns only authentication-relevant data, not full entity
   * This method implements the port interface for other modules (e.g., auth module)
   */
  async findForAuthentication(
    email: Email,
  ): Promise<CustomerAuthenticationData | null> {
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
