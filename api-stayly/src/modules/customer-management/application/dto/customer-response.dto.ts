/**
 * CustomerResponseDto standardizes serialized customer data
 */
import { Customer } from '../../domain/entities/customer.entity';

export class CustomerResponseDto {
  constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly fullName: string,
    public readonly phone: string | null,
    public readonly status: string,
    public readonly emailVerifiedAt: string | null,
    public readonly createdAt: string,
    public readonly updatedAt: string,
  ) {}

  static fromAggregate(customer: Customer): CustomerResponseDto {
    return new CustomerResponseDto(
      customer.getId().getValue(),
      customer.getEmail().getValue(),
      customer.getFullName(),
      customer.getPhone(),
      customer.getStatus().getValue(),
      customer.getEmailVerifiedAt()?.toISOString() ?? null,
      customer.getCreatedAt().toISOString(),
      customer.getUpdatedAt().toISOString(),
    );
  }
}
