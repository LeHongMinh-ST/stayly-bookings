/**
 * RegisterCustomerDto validates signup payload for customers
 */
import { IsEmail, IsOptional, IsString, Matches, MinLength } from 'class-validator';

export class RegisterCustomerDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;

  @IsString()
  @MinLength(2)
  fullName!: string;

  @IsOptional()
  @Matches(/^[0-9+\-()\s]{6,20}$/)
  phone?: string;
}
