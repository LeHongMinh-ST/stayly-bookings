/**
 * RoleAssignmentService implements IRoleAssignmentPort
 * Adapter service for role assignment functionality
 */
import { Inject, Injectable } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { IRoleAssignmentPort } from '../../application/interfaces/role-assignment.port';
import { AssignRolesToUserCommand } from '../../application/commands/assign-roles-to-user.command';
import type { IRoleRepository } from '../../domain/repositories/role.repository.interface';
import { ROLE_REPOSITORY } from '../../domain/repositories/role.repository.interface';
import { Role } from '../../domain/entities/role.entity';

@Injectable()
export class RoleAssignmentService implements IRoleAssignmentPort {
  constructor(
    private readonly commandBus: CommandBus,
    @Inject(ROLE_REPOSITORY)
    private readonly roleRepository: IRoleRepository,
  ) {}

  async assignRolesToUser(userId: string, roles: string[]): Promise<void> {
    const command = new AssignRolesToUserCommand(userId, roles);
    await this.commandBus.execute(command);
  }

  async getAllRoles(): Promise<Role[]> {
    return await this.roleRepository.findAll();
  }
}
