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
import { DefaultCustomersSeedService } from './infrastructure/persistence/seeds/default-customers-seed.service';
import { CustomersController } from './presentation/controllers/customers.controller';
import { CustomerOrmEntity } from './infrastructure/persistence/entities/customer.orm-entity';
import { CustomerAuthenticationService } from './infrastructure/services/customer-authentication.service';
import { CUSTOMER_AUTHENTICATION_PORT } from './application/interfaces/customer-authentication.port';

const commandHandlers = [RegisterCustomerHandler];
const queryHandlers = [GetCustomerProfileHandler];

@Module({
  imports: [CqrsModule, SecurityModule, TypeOrmModule.forFeature([CustomerOrmEntity])],
  controllers: [CustomersController],
  providers: [
    ...commandHandlers,
    ...queryHandlers,
    { provide: CUSTOMER_REPOSITORY, useClass: CustomerRepository },
    // Port implementation for other modules
    // Following Port/Adapter Pattern - export port, not service directly
    {
      provide: CUSTOMER_AUTHENTICATION_PORT,
      useClass: CustomerAuthenticationService,
    },
    // Seed service for CLI usage (it won't auto-run on bootstrap)
    DefaultCustomersSeedService,
  ],
  exports: [
    CUSTOMER_REPOSITORY,
    CUSTOMER_AUTHENTICATION_PORT, // Export port for other modules (Port/Adapter Pattern)
  ],
})
export class CustomerModule {}
