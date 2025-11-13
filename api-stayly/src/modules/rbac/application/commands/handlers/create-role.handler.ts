/**
 * CreateRoleHandler orchestrates role creation workflow
 */
import { Inject, Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { randomUUID } from 'crypto';
import { CreateRoleCommand } from '../create-role.command';
import type { IRoleRepository } from '../../../domain/repositories/role.repository.interface';
import { ROLE_REPOSITORY } from '../../../domain/repositories/role.repository.interface';
import type { IRolePermissionValidationPort } from '../../interfaces/role-permission-validation.port';
import { ROLE_PERMISSION_VALIDATION_PORT } from '../../interfaces/role-permission-validation.port';
import { Role } from '../../../domain/entities/role.entity';
import { RoleId } from '../../../domain/value-objects/role-id.vo';
import { Permission } from '../../../domain/value-objects/permission.vo';
import { RoleResponseDto } from '../../dto/response/role-response.dto';

@Injectable()
@CommandHandler(CreateRoleCommand)
export class CreateRoleHandler
  implements ICommandHandler<CreateRoleCommand, RoleResponseDto>
{
  constructor(
    @Inject(ROLE_REPOSITORY)
    private readonly roleRepository: IRoleRepository,
    @Inject(ROLE_PERMISSION_VALIDATION_PORT)
    private readonly rolePermissionValidation: IRolePermissionValidationPort,
  ) {}

  async execute(command: CreateRoleCommand): Promise<RoleResponseDto> {
    // Check if role code already exists
    const existing = await this.roleRepository.findByCode(command.code);
    if (existing) {
      throw new Error(`Role with code '${command.code}' already exists`);
    }

    // Validate permissions if provided
    let permissions: Permission[] = [];
    if (command.permissions && command.permissions.length > 0) {
      const validatedPermissionCodes =
        await this.rolePermissionValidation.validatePermissions(
          command.permissions,
        );
      permissions = validatedPermissionCodes.map((code) =>
        Permission.create(code),
      );
    }

    const role = Role.create({
      id: RoleId.create(randomUUID()),
      code: command.code,
      displayName: command.displayName,
      isSuperAdmin: false, // Only seed service can create super admin role
      permissions,
    });

    await this.roleRepository.save(role);
    return RoleResponseDto.fromDomain(role);
  }
}

