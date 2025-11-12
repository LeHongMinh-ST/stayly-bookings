/**
 * CreateUserDto validates inbound request payload for creating users
 */
import { ArrayNotEmpty, IsArray, IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;

  @IsString()
  @MinLength(2)
  fullName!: string;

  @IsArray()
  @ArrayNotEmpty()
  roles!: string[];

  @IsArray()
  @IsOptional()
  permissions?: string[];
}
