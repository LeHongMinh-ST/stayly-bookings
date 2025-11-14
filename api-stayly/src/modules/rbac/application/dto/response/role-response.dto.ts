import { ApiProperty } from '@nestjs/swagger';
import { Role } from '../../../domain/entities/role.entity';

export class RoleResponseDto {
  @ApiProperty({
    description: 'Role unique identifier',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id!: string;

  @ApiProperty({
    description: 'Display name for the role',
    example: 'Super Admin',
  })
  displayName!: string;

  @ApiProperty({
    description: 'Whether this is the super admin role',
    example: false,
  })
  isSuperAdmin!: boolean;

  @ApiProperty({
    description: 'Array of permission codes assigned to this role',
    example: ['user:manage', 'booking:read'],
    type: [String],
  })
  permissions!: string[];

  static fromDomain(role: Role): RoleResponseDto {
    return {
      id: role.getId().getValue(),
      displayName: role.getDisplayName(),
      isSuperAdmin: role.getIsSuperAdmin(),
      permissions: role.getPermissions().map((p) => p.getValue()),
    };
  }

  // Backward compatibility method (deprecated)
  static fromValueObject(role: {
    getValue?: () => string;
    displayName?: string;
  }): RoleResponseDto {
    // This method is kept for backward compatibility
    // Should be removed after all code is migrated to use domain entities
    const displayNameValue = role.getValue
      ? role
          .getValue()
          .replace(/_/g, ' ')
          .replace(/\b\w/g, (l: string) => l.toUpperCase())
      : (role.displayName ?? '');

    return {
      id: '',
      displayName: displayNameValue,
      isSuperAdmin: false,
      permissions: [],
    };
  }
}
