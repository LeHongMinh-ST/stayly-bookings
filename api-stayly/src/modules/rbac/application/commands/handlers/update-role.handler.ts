/**
 * UpdateRoleHandler orchestrates role update workflow
 */
import { Inject, Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateRoleCommand } from '../update-role.command';
import type { IRoleRepository } from '../../../domain/repositories/role.repository.interface';
import { ROLE_REPOSITORY } from '../../../domain/repositories/role.repository.interface';
import { RoleId } from '../../../domain/value-objects/role-id.vo';
import { RoleResponseDto } from '../../dto/response/role-response.dto';
import { ensureEntityExists } from '../../../../../common/application/exceptions';

@Injectable()
@CommandHandler(UpdateRoleCommand)
export class UpdateRoleHandler
  implements ICommandHandler<UpdateRoleCommand, RoleResponseDto>
{
  constructor(
    @Inject(ROLE_REPOSITORY)
    private readonly roleRepository: IRoleRepository,
  ) {}

  async execute(command: UpdateRoleCommand): Promise<RoleResponseDto> {
    const roleId = RoleId.create(command.roleId);
    const role = ensureEntityExists(
      await this.roleRepository.findById(roleId),
      'Role',
      roleId.getValue(),
    );

    if (command.displayName) {
      role.updateDisplayName(command.displayName);
    }

    await this.roleRepository.save(role);
    return RoleResponseDto.fromDomain(role);
  }
}
