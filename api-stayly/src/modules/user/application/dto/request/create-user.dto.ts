/**
 * CreateUserDto validates inbound request payload for creating users
 */
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayNotEmpty,
  IsArray,
  IsEmail,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    description: 'User email address',
    example: 'admin@stayly.com',
  })
  @IsEmail()
  email!: string;

  @ApiProperty({
    description: 'User password (minimum 8 characters)',
    example: 'SecurePassword123!',
    minLength: 8,
  })
  @IsString()
  @MinLength(8)
  password!: string;

  @ApiProperty({
    description: 'User full name',
    example: 'John Doe',
    minLength: 2,
  })
  @IsString()
  @MinLength(2)
  fullName!: string;

  @ApiProperty({
    description: 'Array of role names assigned to the user',
    example: ['OWNER', 'MANAGER'],
    type: [String],
  })
  @IsArray()
  @ArrayNotEmpty()
  roles!: string[];

  @ApiPropertyOptional({
    description: 'Array of permission names (optional)',
    example: ['user:manage', 'booking:read'],
    type: [String],
  })
  @IsArray()
  @IsOptional()
  permissions?: string[];
}
