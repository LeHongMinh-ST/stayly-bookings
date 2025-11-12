/**
 * UserResponseDto defines response shape for administrative user resources
 */
import { User } from '../../domain/entities/user.entity';

export class UserResponseDto {
  constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly fullName: string,
    public readonly status: string,
    public readonly roles: string[],
    public readonly permissions: string[],
    public readonly createdAt: string,
    public readonly updatedAt: string,
  ) {}

  static fromAggregate(user: User): UserResponseDto {
    return new UserResponseDto(
      user.getId().getValue(),
      user.getEmail().getValue(),
      user.getFullName(),
      user.getStatus().getValue(),
      user.getRoles().map((role) => role.getValue()),
      user.getPermissions().map((permission) => permission.getValue()),
      user.getCreatedAt().toISOString(),
      user.getUpdatedAt().toISOString(),
    );
  }
}
