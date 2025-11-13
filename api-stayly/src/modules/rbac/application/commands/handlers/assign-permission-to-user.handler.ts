/**
 * AssignPermissionToUserHandler assigns a single permission to a user
 */
import { Inject, Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AssignPermissionToUserCommand } from '../assign-permission-to-user.command';
import type { IPermissionRepository } from '../../../domain/repositories/permission.repository.interface';
import { PERMISSION_REPOSITORY } from '../../../domain/repositories/permission.repository.interface';
import type { IUserPermissionLinkPort } from '../../interfaces/user-permission-link.port';
import { USER_PERMISSION_LINK_PORT } from '../../interfaces/user-permission-link.port';
import type { IUserAccessPort } from '../../../../user/application/interfaces/user-access.port';
import { USER_ACCESS_PORT } from '../../../../user/application/interfaces/user-access.port';
import { UserResponseDto } from '../../../../user/application/dto/response/user-response.dto';

@Injectable()
@CommandHandler(AssignPermissionToUserCommand)
export class AssignPermissionToUserHandler
  implements ICommandHandler<AssignPermissionToUserCommand, UserResponseDto>
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
   * Executes single permission assignment
   * Validates permission exists, then adds permission to user
   */
  async execute(
    command: AssignPermissionToUserCommand,
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

    // Add permission to user
    await this.userPermissionLink.addPermissionToUser(
      command.userId,
      permission.getValue(),
    );

    // Return updated user
    return await this.userAccess.getUserResponse(command.userId);
  }
}

