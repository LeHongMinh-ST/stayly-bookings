/**
 * PermissionAssignmentService implements IPermissionAssignmentPort
 * Adapter service for permission assignment functionality
 */
import { Inject, Injectable } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { IPermissionAssignmentPort } from '../../application/interfaces/permission-assignment.port';
import { PERMISSION_ASSIGNMENT_PORT } from '../../application/interfaces/permission-assignment.port';
import { AssignPermissionsToUserCommand } from '../../application/commands/assign-permissions-to-user.command';
import type { IPermissionRepository } from '../../domain/repositories/permission.repository.interface';
import { PERMISSION_REPOSITORY } from '../../domain/repositories/permission.repository.interface';
import { Permission } from '../../domain/value-objects/permission.vo';

@Injectable()
export class PermissionAssignmentService implements IPermissionAssignmentPort {
  constructor(
    private readonly commandBus: CommandBus,
    @Inject(PERMISSION_REPOSITORY)
    private readonly permissionRepository: IPermissionRepository,
  ) {}

  async assignPermissionsToUser(
    userId: string,
    permissions: string[],
  ): Promise<void> {
    const command = new AssignPermissionsToUserCommand(userId, permissions);
    await this.commandBus.execute(command);
  }

  async getAllPermissions(): Promise<Permission[]> {
    return await this.permissionRepository.findAll();
  }

  async getPermissionsByCodes(codes: string[]): Promise<Permission[]> {
    return await this.permissionRepository.findByCodes(codes);
  }
}
