/**
 * RegisterCustomerDto validates signup payload for customers
 */
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsOptional,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';

export class RegisterCustomerDto {
  @ApiProperty({
    description: 'Customer email address',
    example: 'customer@example.com',
  })
  @IsEmail()
  email!: string;

  @ApiProperty({
    description: 'Customer password (minimum 8 characters)',
    example: 'SecurePassword123!',
    minLength: 8,
  })
  @IsString()
  @MinLength(8)
  password!: string;

  @ApiProperty({
    description: 'Customer full name',
    example: 'John Doe',
    minLength: 2,
  })
  @IsString()
  @MinLength(2)
  fullName!: string;

  @ApiPropertyOptional({
    description: 'Customer phone number',
    example: '+1234567890',
    pattern: '^[0-9+\\-()\\s]{6,20}$',
  })
  @IsOptional()
  @Matches(/^[0-9+\-()\s]{6,20}$/)
  phone?: string;
}
