/**
 * UnassignPermissionFromUserHandler removes a single permission from a user
 */
import { Inject, Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UnassignPermissionFromUserCommand } from '../unassign-permission-from-user.command';
import type { IPermissionRepository } from '../../../domain/repositories/permission.repository.interface';
import { PERMISSION_REPOSITORY } from '../../../domain/repositories/permission.repository.interface';
import type { IUserPermissionLinkPort } from '../../interfaces/user-permission-link.port';
import { USER_PERMISSION_LINK_PORT } from '../../interfaces/user-permission-link.port';
import type { IUserAccessPort } from '../../../../user/application/interfaces/user-access.port';
import { USER_ACCESS_PORT } from '../../../../user/application/interfaces/user-access.port';
import { UserResponseDto } from '../../../../user/application/dto/response/user-response.dto';

@Injectable()
@CommandHandler(UnassignPermissionFromUserCommand)
export class UnassignPermissionFromUserHandler
  implements ICommandHandler<UnassignPermissionFromUserCommand, UserResponseDto>
{
  constructor(
    @Inject(PERMISSION_REPOSITORY)
    private readonly permissionRepository: IPermissionRepository,
    @Inject(USER_PERMISSION_LINK_PORT)
    private readonly userPermissionLink: IUserPermissionLinkPort,
    @Inject(USER_ACCESS_PORT)
    private readonly userAccess: IUserAccessPort,
  ) {}

  /**
   * Executes single permission unassignment
   * Validates permission exists, then removes permission from user
   */
  async execute(
    command: UnassignPermissionFromUserCommand,
  ): Promise<UserResponseDto> {
    // Validate permission exists
    const permission = await this.permissionRepository.findById(
      command.permissionId,
    );
    if (!permission) {
      throw new Error('Permission not found');
    }

    // Validate user exists
    await this.userAccess.ensureUserExists(command.userId);

    // Remove permission from user
    await this.userPermissionLink.removePermissionFromUser(
      command.userId,
      permission.getValue(),
    );

    // Return updated user
    return await this.userAccess.getUserResponse(command.userId);
  }
}

