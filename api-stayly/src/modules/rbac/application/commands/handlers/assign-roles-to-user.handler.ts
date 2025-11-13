/**
 * AssignRolesToUserHandler validates and applies new role set for users
 */
import { Inject, Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AssignRolesToUserCommand } from '../assign-roles-to-user.command';
import type { IRolePermissionValidationPort } from '../../interfaces/role-permission-validation.port';
import { ROLE_PERMISSION_VALIDATION_PORT } from '../../interfaces/role-permission-validation.port';
import { UserResponseDto } from '../../../../user/application/dto/response/user-response.dto';
import { User } from '../../../../user/domain/entities/user.entity';
import type { IUserRepository } from '../../../../user/domain/repositories/user.repository.interface';
import { USER_REPOSITORY } from '../../../../user/domain/repositories/user.repository.interface';
import { UserId } from '../../../../user/domain/value-objects/user-id.vo';
import { UserRole } from '../../../../user/domain/value-objects/user-role.vo';

@Injectable()
@CommandHandler(AssignRolesToUserCommand)
export class AssignRolesToUserHandler
  implements ICommandHandler<AssignRolesToUserCommand, UserResponseDto>
{
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    @Inject(ROLE_PERMISSION_VALIDATION_PORT)
    private readonly rolePermissionValidation: IRolePermissionValidationPort,
  ) {}

  /**
   * Executes role assignment ensuring catalog compliance
   * Uses ports to avoid direct business logic coupling
   */
  async execute(command: AssignRolesToUserCommand): Promise<UserResponseDto> {
    const userId = UserId.create(command.userId);
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Validate roles using RBAC validation port
    const validatedRoleCodes =
      await this.rolePermissionValidation.validateRoles(command.roles);

    const nextRoles = validatedRoleCodes.map((code) => UserRole.from(code));
    const updatedUser = User.rehydrate({
      id: user.getId(),
      email: user.getEmail(),
      fullName: user.getFullName(),
      passwordHash: user.getPasswordHash(),
      status: user.getStatus(),
      roles: nextRoles,
      permissions: user.getPermissions(),
    });
    await this.userRepository.save(updatedUser);
    return UserResponseDto.fromAggregate(updatedUser);
  }
}
