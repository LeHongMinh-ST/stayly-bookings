/**
 * CreateUserHandler orchestrates administrative user creation workflow
 */
import { Inject, Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { randomUUID } from 'crypto';
import { CreateUserCommand } from '../create-user.command';
import type { IUserRepository } from '../../../domain/repositories/user.repository.interface';
import { USER_REPOSITORY } from '../../../domain/repositories/user.repository.interface';
import type { IRoleRepository } from '../../../domain/repositories/role.repository.interface';
import { ROLE_REPOSITORY } from '../../../domain/repositories/role.repository.interface';
import type { IPermissionRepository } from '../../../domain/repositories/permission.repository.interface';
import { PERMISSION_REPOSITORY } from '../../../domain/repositories/permission.repository.interface';
import type { PasswordHasher } from '../../../../../common/application/interfaces/password-hasher.interface';
import { PASSWORD_HASHER } from '../../../../../common/application/interfaces/password-hasher.interface';
import { Email } from '../../../../../common/domain/value-objects/email.vo';
import { PasswordHash } from '../../../../../common/domain/value-objects/password-hash.vo';
import { UserId } from '../../../domain/value-objects/user-id.vo';
import { Role } from '../../../domain/value-objects/role.vo';
import { Permission } from '../../../domain/value-objects/permission.vo';
import { User } from '../../../domain/entities/user.entity';
import { UserResponseDto } from '../../dto/response/user-response.dto';

@Injectable()
@CommandHandler(CreateUserCommand)
export class CreateUserHandler
  implements ICommandHandler<CreateUserCommand, UserResponseDto>
{
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    @Inject(ROLE_REPOSITORY)
    private readonly roleRepository: IRoleRepository,
    @Inject(PERMISSION_REPOSITORY)
    private readonly permissionRepository: IPermissionRepository,
    @Inject(PASSWORD_HASHER)
    private readonly passwordHasher: PasswordHasher,
  ) {}

  /**
   * Executes user creation by validating input, hashing password, and persisting aggregate
   */
  async execute(command: CreateUserCommand): Promise<UserResponseDto> {
    const email = Email.create(command.email);
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new Error('User with email already exists');
    }

    const [normalizedRoles, normalizedPermissions] = await Promise.all([
      this.validateRoles(command.roles),
      this.validatePermissions(command.permissions ?? []),
    ]);

    const passwordHashValue = await this.passwordHasher.hash(command.password);
    const passwordHash = PasswordHash.create(passwordHashValue);

    const user = User.create({
      id: UserId.create(randomUUID()),
      email,
      fullName: command.fullName,
      passwordHash,
      roles: normalizedRoles,
      permissions: normalizedPermissions,
    });

    await this.userRepository.save(user);
    return UserResponseDto.fromAggregate(user);
  }

  private async validateRoles(roleCodes: string[]): Promise<Role[]> {
    if (!roleCodes.length) {
      throw new Error('At least one role is required');
    }

    const catalog = await this.roleRepository.findAll();
    const catalogValues = new Set(catalog.map((role) => role.getValue()));

    const resolvedRoles = roleCodes.map((role) => Role.from(role));
    const unknownRoles = resolvedRoles.filter(
      (role) => !catalogValues.has(role.getValue()),
    );

    if (unknownRoles.length) {
      throw new Error(
        `Unknown role(s): ${unknownRoles.map((role) => role.getValue()).join(', ')}`,
      );
    }

    return resolvedRoles;
  }

  private async validatePermissions(permissionCodes: string[]): Promise<Permission[]> {
    if (!permissionCodes.length) {
      return [];
    }

    const permissions = await this.permissionRepository.findByCodes(permissionCodes);
    const permissionValues = new Set(permissions.map((permission) => permission.getValue()));

    const unknownPermissions = permissionCodes.filter(
      (code) => !permissionValues.has(code.toLowerCase()),
    );

    if (unknownPermissions.length) {
      throw new Error(
        `Unknown permission(s): ${unknownPermissions.join(', ')}`,
      );
    }

    return permissions;
  }
}
