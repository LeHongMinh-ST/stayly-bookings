/**
 * AssignRolesToUserHandler validates and applies new role set for users
 */
import { Inject, Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AssignRolesToUserCommand } from '../assign-roles-to-user.command';
import type { IRolePermissionValidationPort } from '../../interfaces/role-permission-validation.port';
import { ROLE_PERMISSION_VALIDATION_PORT } from '../../interfaces/role-permission-validation.port';
import type { IUserAccessPort } from '../../../../user/application/interfaces/user-access.port';
import { USER_ACCESS_PORT } from '../../../../user/application/interfaces/user-access.port';
import { UserResponseDto } from '../../../../user/application/dto/response/user-response.dto';
import type { IUserRoleLinkPort } from '../../interfaces/user-role-link.port';
import { USER_ROLE_LINK_PORT } from '../../interfaces/user-role-link.port';

@Injectable()
@CommandHandler(AssignRolesToUserCommand)
export class AssignRolesToUserHandler
  implements ICommandHandler<AssignRolesToUserCommand, UserResponseDto>
{
  constructor(
    @Inject(USER_ACCESS_PORT)
    private readonly userAccessPort: IUserAccessPort,
    @Inject(USER_ROLE_LINK_PORT)
    private readonly userRoleLinkPort: IUserRoleLinkPort,
    @Inject(ROLE_PERMISSION_VALIDATION_PORT)
    private readonly rolePermissionValidation: IRolePermissionValidationPort,
  ) {}

  /**
   * Executes role assignment ensuring catalog compliance
   * Uses ports to avoid direct business logic coupling
   */
  async execute(command: AssignRolesToUserCommand): Promise<UserResponseDto> {
    await this.userAccessPort.ensureUserExists(command.userId);

    // Validate roles using RBAC validation port
    const validatedRoleCodes =
      await this.rolePermissionValidation.validateRoles(command.roles);

    await this.userRoleLinkPort.replaceUserRoles(
      command.userId,
      validatedRoleCodes,
    );
    return await this.userAccessPort.getUserResponse(command.userId);
  }
}
