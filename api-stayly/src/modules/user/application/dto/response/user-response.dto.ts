/**
 * UserResponseDto defines response shape for administrative user resources
 */
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../../domain/entities/user.entity';

export class UserResponseDto {
  @ApiProperty({
    description: 'User unique identifier',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id!: string;

  @ApiProperty({
    description: 'User email address',
    example: 'admin@stayly.com',
  })
  email!: string;

  @ApiProperty({ description: 'User full name', example: 'John Doe' })
  fullName!: string;

  @ApiProperty({
    description: 'User account status',
    example: 'active',
    enum: ['active', 'inactive', 'suspended'],
  })
  status!: string;

  @ApiProperty({
    description: 'Array of role names',
    example: ['OWNER', 'MANAGER'],
    type: [String],
  })
  roles!: string[];

  @ApiProperty({
    description: 'Array of permission names',
    example: ['user:manage', 'booking:read'],
    type: [String],
  })
  permissions!: string[];

  constructor(
    id: string,
    email: string,
    fullName: string,
    status: string,
    roles: string[],
    permissions: string[],
  ) {
    this.id = id;
    this.email = email;
    this.fullName = fullName;
    this.status = status;
    this.roles = roles;
    this.permissions = permissions;
  }

  static fromAggregate(user: User): UserResponseDto {
    return new UserResponseDto(
      user.getId().getValue(),
      user.getEmail().getValue(),
      user.getFullName(),
      user.getStatus().getValue(),
      user.getRoles().map((role) => role.getValueAsString()),
      user.getPermissions().map((permission) => permission.getValue()),
    );
  }
}
