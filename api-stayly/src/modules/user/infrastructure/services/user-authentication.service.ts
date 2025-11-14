/**
 * UserAuthenticationService provides authentication-specific data for other modules
 * This service implements IUserAuthenticationPort and encapsulates user authentication logic
 * Following Port/Adapter Pattern - service implements port defined in application layer
 *
 * Note: This service only returns user information. Roles and permissions are queried
 * separately from RBAC module via IUserRolePermissionQueryPort
 */
import { Inject, Injectable } from "@nestjs/common";
import { Email } from "../../../../common/domain/value-objects/email.vo";
import type { IUserRepository } from "../../domain/repositories/user.repository.interface";
import { USER_REPOSITORY } from "../../domain/repositories/user.repository.interface";
import type {
  IUserAuthenticationPort,
  UserAuthenticationData,
} from "../../application/interfaces/user-authentication.port";

@Injectable()
export class UserAuthenticationService implements IUserAuthenticationPort {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {}

  /**
   * Finds user by email for authentication purposes
   * Returns only authentication-relevant data, not full entity
   * This method implements the port interface for other modules (e.g., auth module)
   *
   * Note: Roles and permissions are not included here. They should be queried
   * separately from RBAC module using IUserRolePermissionQueryPort
   */
  async findForAuthentication(
    email: Email,
  ): Promise<UserAuthenticationData | null> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      return null;
    }

    return {
      id: user.getId().getValue(),
      email: user.getEmail().getValue(),
      passwordHash: user.getPasswordHash().getValue(),
      isActive: user.isActive(),
    };
  }
}
