/**
 * UserAuthenticationService provides authentication-specific data for other modules
 * This service implements IUserAuthenticationPort and encapsulates user authentication logic
 * Following Port/Adapter Pattern - service implements port defined in application layer
 */
import { Inject, Injectable } from '@nestjs/common';
import { Email } from '../../../../common/domain/value-objects/email.vo';
import type { IUserRepository } from '../../domain/repositories/user.repository.interface';
import { USER_REPOSITORY } from '../../domain/repositories/user.repository.interface';
import type {
  IUserAuthenticationPort,
  UserAuthenticationData,
} from '../../application/interfaces/user-authentication.port';
import type { IRoleRepository } from '../../../rbac/domain/repositories/role.repository.interface';
import { ROLE_REPOSITORY } from '../../../rbac/domain/repositories/role.repository.interface';

@Injectable()
export class UserAuthenticationService implements IUserAuthenticationPort {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    @Inject(ROLE_REPOSITORY)
    private readonly roleRepository: IRoleRepository,
  ) {}

  /**
   * Finds user by email for authentication purposes
   * Returns only authentication-relevant data, not full entity
   * This method implements the port interface for other modules (e.g., auth module)
   */
  async findForAuthentication(
    email: Email,
  ): Promise<UserAuthenticationData | null> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      return null;
    }

    // Get permissions directly assigned to user
    const directPermissions = user
      .getPermissions()
      .map((permission) => permission.getValue());

    // Get role codes
    const roleCodes = user.getRoles().map((role) => role.getValueAsString());

    // Load roles with permissions to get permissions from roles
    const allPermissions = new Set<string>(directPermissions);
    if (roleCodes.length > 0) {
      const roles = await this.roleRepository.findAll();
      const userRoles = roles.filter((role) =>
        roleCodes.includes(role.getCode()),
      );
      for (const role of userRoles) {
        const rolePermissions = role.getPermissions().map((p) => p.getValue());
        rolePermissions.forEach((perm) => allPermissions.add(perm));
      }
    }

    return {
      id: user.getId().getValue(),
      email: user.getEmail().getValue(),
      passwordHash: user.getPasswordHash().getValue(),
      isActive: user.isActive(),
      roles: roleCodes,
      permissions: Array.from(allPermissions),
    };
  }
}
