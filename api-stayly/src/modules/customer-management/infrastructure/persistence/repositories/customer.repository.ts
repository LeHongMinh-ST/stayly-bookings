/**
 * CustomerRepository persists customer aggregates via TypeORM
 */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ICustomerRepository } from '../../../domain/repositories/customer.repository.interface';
import { Customer } from '../../../domain/entities/customer.entity';
import { CustomerId } from '../../../domain/value-objects/customer-id.vo';
import { Email } from '../../../../../common/domain/value-objects/email.vo';
import { CustomerOrmEntity } from '../entities/customer.orm-entity';
import { CustomerOrmMapper } from '../mappers/customer.mapper';

@Injectable()
export class CustomerRepository implements ICustomerRepository {
  constructor(
    @InjectRepository(CustomerOrmEntity)
    private readonly customerRepo: Repository<CustomerOrmEntity>,
  ) {}

  async save(customer: Customer): Promise<void> {
    const existing = await this.customerRepo.findOne({
      where: { id: customer.getId().getValue() },
    });
    const entity = CustomerOrmMapper.toOrm(customer, existing ?? undefined);
    await this.customerRepo.save(entity);
  }

  async findById(id: CustomerId): Promise<Customer | null> {
    const entity = await this.customerRepo.findOne({
      where: { id: id.getValue() },
    });
    return entity ? CustomerOrmMapper.toDomain(entity) : null;
  }

  async findByEmail(email: Email): Promise<Customer | null> {
    const entity = await this.customerRepo.findOne({
      where: { email: email.getValue() },
    });
    return entity ? CustomerOrmMapper.toDomain(entity) : null;
  }
}
