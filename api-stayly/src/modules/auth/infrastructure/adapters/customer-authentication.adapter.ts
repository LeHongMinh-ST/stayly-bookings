/**
 * CustomerAuthenticationAdapter adapts ICustomerAuthenticationPort from customer module
 * to ICustomerAuthenticationService interface for auth module
 *
 * Following Port/Adapter Pattern:
 * - Port (interface) is defined in customer module application layer
 * - Adapter is in infrastructure layer, so it CAN import from other modules
 * - Application layer only depends on interface, not this adapter
 * - Infrastructure layer handles cross-module communication
 */
import { Inject, Injectable } from "@nestjs/common";
import { Email } from "../../../../common/domain/value-objects/email.vo";
import { PasswordHash } from "../../../../common/domain/value-objects/password-hash.vo";
import type { ICustomerAuthenticationPort } from "../../../customer/application/interfaces/customer-authentication.port";
import { CUSTOMER_AUTHENTICATION_PORT } from "../../../customer/application/interfaces/customer-authentication.port";
import type {
  ICustomerAuthenticationService,
  CustomerAuthenticationData,
} from "../../application/interfaces/customer-authentication.service.interface";

@Injectable()
export class CustomerAuthenticationAdapter
  implements ICustomerAuthenticationService
{
  constructor(
    @Inject(CUSTOMER_AUTHENTICATION_PORT)
    private readonly customerAuthenticationPort: ICustomerAuthenticationPort,
  ) {}

  /**
   * Adapts customer module port to auth module interface
   * Infrastructure layer handles the mapping between modules
   */
  async findForAuthentication(
    email: Email,
  ): Promise<CustomerAuthenticationData | null> {
    return this.customerAuthenticationPort.findForAuthentication(email);
  }

  /**
   * Delegates password hash update to customer module
   */
  async updatePasswordHash(
    customerId: string,
    passwordHash: PasswordHash,
  ): Promise<void> {
    await this.customerAuthenticationPort.updatePasswordHash(
      customerId,
      passwordHash,
    );
  }
}
