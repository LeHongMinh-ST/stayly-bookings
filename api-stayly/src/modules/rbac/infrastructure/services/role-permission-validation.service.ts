/**
 * RolePermissionValidationService implements IRolePermissionValidationPort
 * Provides validation capabilities for roles and permissions
 */
import { Inject, Injectable } from "@nestjs/common";
import type { IRoleRepository } from "../../domain/repositories/role.repository.interface";
import { ROLE_REPOSITORY } from "../../domain/repositories/role.repository.interface";
import type { IPermissionRepository } from "../../domain/repositories/permission.repository.interface";
import { PERMISSION_REPOSITORY } from "../../domain/repositories/permission.repository.interface";
import type { IRolePermissionValidationPort } from "../../application/interfaces/role-permission-validation.port";
import { RoleId } from "../../domain/value-objects/role-id.vo";
import { throwInvalidInput } from "../../../../common/application/exceptions";

@Injectable()
export class RolePermissionValidationService
  implements IRolePermissionValidationPort
{
  constructor(
    @Inject(ROLE_REPOSITORY)
    private readonly roleRepository: IRoleRepository,
    @Inject(PERMISSION_REPOSITORY)
    private readonly permissionRepository: IPermissionRepository,
  ) {}

  /**
   * Validates role IDs by checking if roles exist and have permissions assigned
   * Super admin roles are always valid even without permissions
   */
  async validateRoles(roleIds: string[]): Promise<string[]> {
    if (!roleIds.length) {
      throwInvalidInput("At least one role is required", "roleIds");
    }

    const validatedRoleIds: string[] = [];
    const invalidRoleIds: string[] = [];

    for (const roleIdStr of roleIds) {
      try {
        const roleId = RoleId.create(roleIdStr);
        const role = await this.roleRepository.findById(roleId);

        if (!role) {
          invalidRoleIds.push(roleIdStr);
          continue;
        }

        // Super admin roles are always valid
        if (role.getIsSuperAdmin()) {
          validatedRoleIds.push(roleIdStr);
          continue;
        }

        // Check if role has permissions assigned
        const permissions = role.getPermissions();
        if (permissions.length === 0) {
          invalidRoleIds.push(roleIdStr);
          continue;
        }

        validatedRoleIds.push(roleIdStr);
      } catch {
        invalidRoleIds.push(roleIdStr);
      }
    }

    if (invalidRoleIds.length > 0) {
      throwInvalidInput(
        `Invalid role(s) or role(s) without permissions: ${invalidRoleIds.join(", ")}`,
        "roleIds",
      );
    }

    return validatedRoleIds;
  }

  async validatePermissions(permissionCodes: string[]): Promise<string[]> {
    if (!permissionCodes.length) {
      return [];
    }

    const permissions =
      await this.permissionRepository.findByCodes(permissionCodes);
    const permissionValues = new Set<string>(
      permissions.map((permission) => permission.getValue()),
    );

    const unknownPermissions = permissionCodes.filter(
      (code) => !permissionValues.has(code.toLowerCase()),
    );

    if (unknownPermissions.length) {
      throwInvalidInput(
        `Unknown permission(s): ${unknownPermissions.join(", ")}`,
        "permissions",
      );
    }

    return permissionCodes;
  }
}
