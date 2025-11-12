/**
 * CustomerAuthenticationAdapter adapts CustomerAuthenticationService from customer-management module
 * to ICustomerAuthenticationService interface for auth module
 * Following Adapter Pattern - adapters use services, not repositories
 * Services are exported from modules and provide what other modules need
 */
import { Inject, Injectable } from '@nestjs/common';
import { Email } from '../../../../common/domain/value-objects/email.vo';
import type { CustomerAuthenticationService } from '../../../customer-management/infrastructure/services/customer-authentication.service';
import { CUSTOMER_AUTHENTICATION_SERVICE } from '../../../customer-management/infrastructure/services/customer-authentication.service';
import type {
  ICustomerAuthenticationService,
  CustomerAuthenticationData,
} from '../../application/interfaces/customer-authentication.service.interface';

@Injectable()
export class CustomerAuthenticationAdapter implements ICustomerAuthenticationService {
  constructor(
    @Inject(CUSTOMER_AUTHENTICATION_SERVICE)
    private readonly customerAuthenticationService: CustomerAuthenticationService,
  ) {}

  /**
   * Delegates to CustomerAuthenticationService
   * Adapter uses service, not repository directly
   */
  async findForAuthentication(email: Email): Promise<CustomerAuthenticationData | null> {
    return this.customerAuthenticationService.findForAuthentication(email);
  }
}

