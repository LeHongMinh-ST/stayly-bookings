/**
 * AssignPermissionsToUserDto validates permission assignment updates
 */
import { ApiProperty } from '@nestjs/swagger';
import { ArrayNotEmpty, IsArray } from 'class-validator';

export class AssignPermissionsToUserDto {
  @ApiProperty({
    description: 'Array of permission codes to assign to the user',
    example: ['user:read', 'booking:manage'],
    type: [String],
  })
  @IsArray()
  @ArrayNotEmpty()
  permissions!: string[];
}

