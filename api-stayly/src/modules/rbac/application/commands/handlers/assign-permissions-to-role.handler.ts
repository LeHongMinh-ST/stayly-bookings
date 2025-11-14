/**
 * AssignPermissionsToRoleHandler validates and applies permissions to role
 */
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AssignPermissionsToRoleCommand } from '../assign-permissions-to-role.command';
import type { IRoleRepository } from '../../../domain/repositories/role.repository.interface';
import { ROLE_REPOSITORY } from '../../../domain/repositories/role.repository.interface';
import type { IRolePermissionValidationPort } from '../../interfaces/role-permission-validation.port';
import { ROLE_PERMISSION_VALIDATION_PORT } from '../../interfaces/role-permission-validation.port';
import { RoleId } from '../../../domain/value-objects/role-id.vo';
import { Permission } from '../../../domain/value-objects/permission.vo';
import { RoleResponseDto } from '../../dto/response/role-response.dto';

@Injectable()
@CommandHandler(AssignPermissionsToRoleCommand)
export class AssignPermissionsToRoleHandler
  implements ICommandHandler<AssignPermissionsToRoleCommand, RoleResponseDto>
{
  constructor(
    @Inject(ROLE_REPOSITORY)
    private readonly roleRepository: IRoleRepository,
    @Inject(ROLE_PERMISSION_VALIDATION_PORT)
    private readonly rolePermissionValidation: IRolePermissionValidationPort,
  ) {}

  async execute(
    command: AssignPermissionsToRoleCommand,
  ): Promise<RoleResponseDto> {
    const roleId = RoleId.create(command.roleId);
    const role = await this.roleRepository.findById(roleId);
    if (!role) {
      throw new NotFoundException('Role not found');
    }

    // Validate permissions
    const validatedPermissionCodes =
      await this.rolePermissionValidation.validatePermissions(
        command.permissions,
      );

    // Convert to Permission value objects
    const permissions = validatedPermissionCodes.map((code) =>
      Permission.create(code),
    );

    role.assignPermissions(permissions);
    await this.roleRepository.save(role);
    return RoleResponseDto.fromDomain(role);
  }
}
