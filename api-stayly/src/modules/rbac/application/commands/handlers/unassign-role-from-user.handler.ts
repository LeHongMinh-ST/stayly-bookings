/**
 * UnassignRoleFromUserHandler removes a single role from a user
 */
import { Inject, Injectable } from "@nestjs/common";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { UnassignRoleFromUserCommand } from "../unassign-role-from-user.command";
import type { IRoleRepository } from "../../../domain/repositories/role.repository.interface";
import { ROLE_REPOSITORY } from "../../../domain/repositories/role.repository.interface";
import type { IUserRoleLinkPort } from "../../interfaces/user-role-link.port";
import { USER_ROLE_LINK_PORT } from "../../interfaces/user-role-link.port";
import type { IUserAccessPort } from "../../../../user/application/interfaces/user-access.port";
import { USER_ACCESS_PORT } from "../../../../user/application/interfaces/user-access.port";
import { RoleId } from "../../../domain/value-objects/role-id.vo";
import { UserResponseDto } from "../../../../user/application/dto/response/user-response.dto";
import { ensureEntityExists } from "../../../../../common/application/exceptions";

@Injectable()
@CommandHandler(UnassignRoleFromUserCommand)
export class UnassignRoleFromUserHandler
  implements ICommandHandler<UnassignRoleFromUserCommand, UserResponseDto>
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
   * Executes single role unassignment
   * Validates role exists, then removes role from user
   */
  async execute(
    command: UnassignRoleFromUserCommand,
  ): Promise<UserResponseDto> {
    // Validate role exists
    const roleId = RoleId.create(command.roleId);
    ensureEntityExists(
      await this.roleRepository.findById(roleId),
      "Role",
      roleId.getValue(),
    );

    // Validate user exists
    await this.userAccess.ensureUserExists(command.userId);

    // Remove role from user
    await this.userRoleLink.removeRoleFromUser(
      command.userId,
      roleId.getValue(),
    );

    // Return updated user
    return await this.userAccess.getUserResponse(command.userId);
  }
}
