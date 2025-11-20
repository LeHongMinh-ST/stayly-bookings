/**
 * UserAuthorizationService adapts RBAC user-role query capabilities for accommodation module.
 * It implements IUserAuthorizationPort so that application layer can stay decoupled from RBAC details.
 */
import { Inject, Injectable } from "@nestjs/common";
import {
  USER_ROLE_PERMISSION_QUERY_PORT,
  type IUserRolePermissionQueryPort,
} from "../../../rbac/application/interfaces/user-role-permission-query.port";
import {
  IUserAuthorizationPort,
  USER_AUTHORIZATION_PORT,
} from "../../application/interfaces/user-authorization.port";

@Injectable()
export class UserAuthorizationService implements IUserAuthorizationPort {
  constructor(
    @Inject(USER_ROLE_PERMISSION_QUERY_PORT)
    private readonly rolePermissionQueryPort: IUserRolePermissionQueryPort,
  ) {}

  async isSuperAdmin(userId: string): Promise<boolean> {
    const { isSuperAdmin } =
      await this.rolePermissionQueryPort.getUserRolesAndPermissions(userId);
    return isSuperAdmin;
  }
}

export const USER_AUTHORIZATION_SERVICE = {
  provide: USER_AUTHORIZATION_PORT,
  useClass: UserAuthorizationService,
};
