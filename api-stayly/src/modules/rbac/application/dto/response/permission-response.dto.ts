/**
 * PermissionResponseDto defines response shape for permission resources
 */
import { ApiProperty } from '@nestjs/swagger';

export class PermissionResponseDto {
  @ApiProperty({ description: 'Permission code', example: 'user:manage' })
  code!: string;

  @ApiProperty({
    description: 'Permission description',
    example: 'Full user management',
  })
  description!: string | null;

  constructor(code: string, description: string | null) {
    this.code = code;
    this.description = description;
  }

  static fromValueObject(permission: {
    getValue(): string;
  }): PermissionResponseDto {
    // For now, just return the code. In future, we might need to fetch description from DB
    return new PermissionResponseDto(permission.getValue(), null);
  }
}
