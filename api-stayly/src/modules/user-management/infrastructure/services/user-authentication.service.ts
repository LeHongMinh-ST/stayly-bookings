/**
 * UserAuthenticationService provides authentication-specific data for other modules
 * This service encapsulates user authentication logic and exposes only necessary data
 * Following Service Pattern - modules communicate via services, not repositories
 */
import { Inject, Injectable } from '@nestjs/common';
import { Email } from '../../../../common/domain/value-objects/email.vo';
import type { IUserRepository } from '../../domain/repositories/user.repository.interface';
import { USER_REPOSITORY } from '../../domain/repositories/user.repository.interface';

/**
 * User authentication data required for authentication flow
 * Only exposes necessary fields, not the full User entity
 */
export interface UserAuthenticationData {
  id: string;
  email: string;
  passwordHash: string;
  isActive: boolean;
  roles: string[];
  permissions: string[];
}

@Injectable()
export class UserAuthenticationService {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {}

  /**
   * Finds user by email for authentication purposes
   * Returns only authentication-relevant data, not full entity
   * This method is designed to be used by other modules (e.g., auth module)
   */
  async findForAuthentication(email: Email): Promise<UserAuthenticationData | null> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      return null;
    }

    return {
      id: user.getId().getValue(),
      email: user.getEmail().getValue(),
      passwordHash: user.getPasswordHash().getValue(),
      isActive: user.isActive(),
      roles: user.getRoles().map((role) => role.getValue()),
      permissions: user.getPermissions().map((permission) => permission.getValue()),
    };
  }
}

export const USER_AUTHENTICATION_SERVICE = 'USER_AUTHENTICATION_SERVICE';

