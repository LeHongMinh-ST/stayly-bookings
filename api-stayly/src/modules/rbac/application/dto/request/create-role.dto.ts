import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsArray } from 'class-validator';

export class CreateRoleDto {
  @ApiProperty({
    description: 'Display name for the role',
    example: 'Custom Manager',
  })
  @IsNotEmpty()
  @IsString()
  displayName!: string;

  @ApiProperty({
    description: 'Array of permission codes to assign to this role',
    example: ['user:read', 'booking:manage'],
    type: [String],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  permissions?: string[];
}

