/**
 * DeleteRoleHandler orchestrates role deletion workflow
 */
import { Inject, Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DeleteRoleCommand } from '../delete-role.command';
import type { IRoleRepository } from '../../../domain/repositories/role.repository.interface';
import { ROLE_REPOSITORY } from '../../../domain/repositories/role.repository.interface';
import { RoleId } from '../../../domain/value-objects/role-id.vo';

@Injectable()
@CommandHandler(DeleteRoleCommand)
export class DeleteRoleHandler
  implements ICommandHandler<DeleteRoleCommand, void>
{
  constructor(
    @Inject(ROLE_REPOSITORY)
    private readonly roleRepository: IRoleRepository,
  ) {}

  async execute(command: DeleteRoleCommand): Promise<void> {
    const roleId = RoleId.create(command.roleId);
    const role = await this.roleRepository.findById(roleId);
    if (!role) {
      throw new Error('Role not found');
    }

    if (!role.canDelete()) {
      throw new Error('Cannot delete super admin role');
    }

    await this.roleRepository.delete(role);
  }
}

