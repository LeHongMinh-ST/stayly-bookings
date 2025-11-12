/**
 * AssignRolesHandler validates and applies new role set for users
 */
import { Inject, Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AssignRolesCommand } from '../assign-roles.command';
import type { IUserRepository } from '../../../domain/repositories/user.repository.interface';
import { USER_REPOSITORY } from '../../../domain/repositories/user.repository.interface';
import type { IRoleRepository } from '../../../domain/repositories/role.repository.interface';
import { ROLE_REPOSITORY } from '../../../domain/repositories/role.repository.interface';
import { UserId } from '../../../domain/value-objects/user-id.vo';
import { Role } from '../../../domain/value-objects/role.vo';
import { UserResponseDto } from '../../dto/response/user-response.dto';

@Injectable()
@CommandHandler(AssignRolesCommand)
export class AssignRolesHandler
  implements ICommandHandler<AssignRolesCommand, UserResponseDto>
{
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    @Inject(ROLE_REPOSITORY)
    private readonly roleRepository: IRoleRepository,
  ) {}

  /**
   * Executes role assignment ensuring catalog compliance
   */
  async execute(command: AssignRolesCommand): Promise<UserResponseDto> {
    const userId = UserId.create(command.userId);
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const availableRoles = await this.roleRepository.findAll();
    const available = new Set(availableRoles.map((role) => role.getValue()));
    const desiredRoles = command.roles.map((role) => Role.from(role));

    const unknown = desiredRoles.filter((role) => !available.has(role.getValue()));
    if (unknown.length) {
      throw new Error(
        `Unknown role(s): ${unknown.map((role) => role.getValue()).join(', ')}`,
      );
    }

    user.assignRoles(desiredRoles);
    await this.userRepository.save(user);
    return UserResponseDto.fromAggregate(user);
  }
}
