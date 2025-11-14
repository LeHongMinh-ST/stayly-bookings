/**
 * RegisterCustomerHandler processes self-service customer registrations
 */
import { Inject, Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { randomUUID } from 'crypto';
import { RegisterCustomerCommand } from '../register-customer.command';
import type { ICustomerRepository } from '../../../domain/repositories/customer.repository.interface';
import { CUSTOMER_REPOSITORY } from '../../../domain/repositories/customer.repository.interface';
import type { PasswordHasher } from '../../../../../common/application/interfaces/password-hasher.interface';
import { PASSWORD_HASHER } from '../../../../../common/application/interfaces/password-hasher.interface';
import { Email } from '../../../../../common/domain/value-objects/email.vo';
import { PasswordHash } from '../../../../../common/domain/value-objects/password-hash.vo';
import { CustomerId } from '../../../domain/value-objects/customer-id.vo';
import { Customer } from '../../../domain/entities/customer.entity';
import { CustomerResponseDto } from '../../dto/response/customer-response.dto';
import { throwConflict } from '../../../../../common/application/exceptions';

@Injectable()
@CommandHandler(RegisterCustomerCommand)
export class RegisterCustomerHandler
  implements ICommandHandler<RegisterCustomerCommand, CustomerResponseDto>
{
  constructor(
    @Inject(CUSTOMER_REPOSITORY)
    private readonly customerRepository: ICustomerRepository,
    @Inject(PASSWORD_HASHER)
    private readonly passwordHasher: PasswordHasher,
  ) {}

  /**
   * Executes customer registration ensuring email uniqueness and hashing password
   */
  async execute(
    command: RegisterCustomerCommand,
  ): Promise<CustomerResponseDto> {
    const email = Email.create(command.email);
    const existingCustomer = await this.customerRepository.findByEmail(email);
    if (existingCustomer) {
      throwConflict('Email already registered', 'DUPLICATE_EMAIL');
    }

    const hashed = await this.passwordHasher.hash(command.password);
    const customer = Customer.register({
      id: CustomerId.create(randomUUID()),
      email,
      fullName: command.fullName,
      passwordHash: PasswordHash.create(hashed),
      phone: command.phone ?? null,
    });

    await this.customerRepository.save(customer);
    return CustomerResponseDto.fromAggregate(customer);
  }
}
