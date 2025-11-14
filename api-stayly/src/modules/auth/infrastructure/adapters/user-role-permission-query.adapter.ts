/**
 * UserRolePermissionQueryAdapter adapts IUserRolePermissionQueryPort from RBAC module
 * to IUserRolePermissionQueryService interface for auth module
 *
 * Following Port/Adapter Pattern:
 * - Port (interface) is defined in RBAC module application layer
 * - Adapter is in infrastructure layer, so it CAN import from other modules
 * - Application layer only depends on interface, not this adapter
 * - Infrastructure layer handles cross-module communication
 */
import { Inject, Injectable } from "@nestjs/common";
import type { IUserRolePermissionQueryPort } from "../../../rbac/application/interfaces/user-role-permission-query.port";
import { USER_ROLE_PERMISSION_QUERY_PORT } from "../../../rbac/application/interfaces/user-role-permission-query.port";
import type {
  IUserRolePermissionQueryService,
  UserRolePermissionData,
} from "../../application/interfaces/user-role-permission-query.service.interface";

@Injectable()
export class UserRolePermissionQueryAdapter
  implements IUserRolePermissionQueryService
{
  constructor(
    @Inject(USER_ROLE_PERMISSION_QUERY_PORT)
    private readonly userRolePermissionQueryPort: IUserRolePermissionQueryPort,
  ) {}

  /**
   * Adapts RBAC module port to auth module interface
   * Infrastructure layer handles the mapping between modules
   */
  async getUserRolesAndPermissions(
    userId: string,
  ): Promise<UserRolePermissionData> {
    return this.userRolePermissionQueryPort.getUserRolesAndPermissions(userId);
  }
}
