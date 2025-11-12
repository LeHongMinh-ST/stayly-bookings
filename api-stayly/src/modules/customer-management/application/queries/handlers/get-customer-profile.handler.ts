/**
 * GetCustomerProfileHandler resolves customer aggregate for authenticated user
 */
import { Inject, Injectable } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetCustomerProfileQuery } from '../get-customer-profile.query';
import {
  CUSTOMER_REPOSITORY,
} from '../../../domain/repositories/customer.repository.interface';
import type { ICustomerRepository } from '../../../domain/repositories/customer.repository.interface';
import { CustomerId } from '../../../domain/value-objects/customer-id.vo';
import { CustomerResponseDto } from '../../dto/customer-response.dto';

@Injectable()
@QueryHandler(GetCustomerProfileQuery)
export class GetCustomerProfileHandler
  implements IQueryHandler<GetCustomerProfileQuery, CustomerResponseDto> {
  constructor(
    @Inject(CUSTOMER_REPOSITORY)
    private readonly customerRepository: ICustomerRepository,
  ) { }

  /**
   * Executes retrieval logic returning customer profile DTO
   */
  async execute(query: GetCustomerProfileQuery): Promise<CustomerResponseDto> {
    const customerId = CustomerId.create(query.customerId);
    const customer = await this.customerRepository.findById(customerId);
    if (!customer) {
      throw new Error('Customer not found');
    }
    return CustomerResponseDto.fromAggregate(customer);
  }
}
