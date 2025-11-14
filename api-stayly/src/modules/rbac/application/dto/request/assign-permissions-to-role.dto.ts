import { ApiProperty } from '@nestjs/swagger';
import { ArrayNotEmpty, IsArray, IsString } from 'class-validator';

export class AssignPermissionsToRoleDto {
  @ApiProperty({
    description: 'Array of permission codes to assign to the role',
    example: ['user:manage', 'booking:read'],
    type: [String],
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  permissions!: string[];
}
