/**
 * IRoleAssignmentPort provides role assignment capabilities
 * Port for User module to assign roles to users
 */
import { Role } from '../../domain/entities/role.entity';

export interface IRoleAssignmentPort {
  /**
   * Assigns roles to a user
   * @param userId - User ID
   * @param roles - Array of role codes
   */
  assignRolesToUser(userId: string, roles: string[]): Promise<void>;

  /**
   * Gets all available roles from catalog
   */
  getAllRoles(): Promise<Role[]>;
}

export const ROLE_ASSIGNMENT_PORT = 'ROLE_ASSIGNMENT_PORT';

