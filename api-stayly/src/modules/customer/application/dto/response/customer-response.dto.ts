/**
 * CustomerResponseDto standardizes serialized customer data
 */
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Customer } from "../../../domain/entities/customer.entity";

export class CustomerResponseDto {
  @ApiProperty({
    description: "Customer unique identifier",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  id!: string;

  @ApiProperty({
    description: "Customer email address",
    example: "customer@example.com",
  })
  email!: string;

  @ApiProperty({ description: "Customer full name", example: "John Doe" })
  fullName!: string;

  @ApiPropertyOptional({
    description: "Customer phone number",
    example: "+1234567890",
    nullable: true,
  })
  phone!: string | null;

  @ApiProperty({ description: "Customer account status", example: "active" })
  status!: string;

  @ApiPropertyOptional({
    description: "Email verification timestamp",
    example: "2024-01-01T00:00:00.000Z",
    nullable: true,
  })
  emailVerifiedAt!: string | null;

  constructor(
    id: string,
    email: string,
    fullName: string,
    phone: string | null,
    status: string,
    emailVerifiedAt: string | null,
  ) {
    this.id = id;
    this.email = email;
    this.fullName = fullName;
    this.phone = phone;
    this.status = status;
    this.emailVerifiedAt = emailVerifiedAt;
  }

  static fromAggregate(customer: Customer): CustomerResponseDto {
    return new CustomerResponseDto(
      customer.getId().getValue(),
      customer.getEmail().getValue(),
      customer.getFullName(),
      customer.getPhone(),
      customer.getStatus().getValue(),
      customer.getEmailVerifiedAt()?.toISOString() ?? null,
    );
  }
}
