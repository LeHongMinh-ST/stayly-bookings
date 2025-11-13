/**
 * AssignRoleToUserHandler assigns a single role to a user
 */
import { Inject, Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AssignRoleToUserCommand } from '../assign-role-to-user.command';
import type { IRoleRepository } from '../../../domain/repositories/role.repository.interface';
import { ROLE_REPOSITORY } from '../../../domain/repositories/role.repository.interface';
import type { IUserRoleLinkPort } from '../../interfaces/user-role-link.port';
import { USER_ROLE_LINK_PORT } from '../../interfaces/user-role-link.port';
import type { IUserAccessPort } from '../../../../user/application/interfaces/user-access.port';
import { USER_ACCESS_PORT } from '../../../../user/application/interfaces/user-access.port';
import { RoleId } from '../../../domain/value-objects/role-id.vo';
import { UserResponseDto } from '../../../../user/application/dto/response/user-response.dto';

@Injectable()
@CommandHandler(AssignRoleToUserCommand)
export class AssignRoleToUserHandler
  implements ICommandHandler<AssignRoleToUserCommand, UserResponseDto>
{
  constructor(
    @Inject(ROLE_REPOSITORY)
    private readonly roleRepository: IRoleRepository,
    @Inject(USER_ROLE_LINK_PORT)
    private readonly userRoleLink: IUserRoleLinkPort,
    @Inject(USER_ACCESS_PORT)
    private readonly userAccess: IUserAccessPort,
  ) {}

  /**
   * Executes single role assignment
   * Validates role exists, then adds role to user
   */
  async execute(command: AssignRoleToUserCommand): Promise<UserResponseDto> {
    // Validate role exists
    const roleId = RoleId.create(command.roleId);
    const role = await this.roleRepository.findById(roleId);
    if (!role) {
      throw new Error('Role not found');
    }

    // Validate user exists
    await this.userAccess.ensureUserExists(command.userId);

    // Add role to user
    await this.userRoleLink.addRoleToUser(command.userId, role.getCode());

    // Return updated user
    return await this.userAccess.getUserResponse(command.userId);
  }
}

