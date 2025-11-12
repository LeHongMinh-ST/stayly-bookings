/**
 * Customer Management Module
 * Handles customer onboarding and profile flows
 */

import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SecurityModule } from '../../common/infrastructure/security/security.module';
import { RegisterCustomerHandler } from './application/commands/handlers/register-customer.handler';
import { GetCustomerProfileHandler } from './application/queries/handlers/get-customer-profile.handler';
import { CUSTOMER_REPOSITORY } from './domain/repositories/customer.repository.interface';
import { CustomerRepository } from './infrastructure/persistence/repositories/customer.repository';
import { CustomersController } from './presentation/controllers/customers.controller';
import { CustomerOrmEntity } from './infrastructure/persistence/entities/customer.orm-entity';

const commandHandlers = [RegisterCustomerHandler];
const queryHandlers = [GetCustomerProfileHandler];

@Module({
  imports: [CqrsModule, SecurityModule, TypeOrmModule.forFeature([CustomerOrmEntity])],
  controllers: [CustomersController],
  providers: [
    ...commandHandlers,
    ...queryHandlers,
    { provide: CUSTOMER_REPOSITORY, useClass: CustomerRepository },
  ],
  exports: [CUSTOMER_REPOSITORY],
})
export class CustomerManagementModule {}
