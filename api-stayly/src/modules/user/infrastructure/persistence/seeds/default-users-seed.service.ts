/**
 * DefaultUsersSeedService provides seeding logic for default admin user
 */
import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';
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
import { User } from '../../../domain/entities/user.entity';
import { UserId } from '../../../domain/value-objects/user-id.vo';
import type { Role } from '../../../domain/value-objects/role.vo';
import { UserRole } from '../../../domain/value-objects/role.vo';
import type { Permission } from '../../../domain/value-objects/permission.vo';

@Injectable()
export class DefaultUsersSeedService {
  private readonly logger = new Logger(DefaultUsersSeedService.name);

  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    @Inject(ROLE_REPOSITORY)
    private readonly roleRepository: IRoleRepository,
    @Inject(PERMISSION_REPOSITORY)
    private readonly permissionRepository: IPermissionRepository,
    @Inject(PASSWORD_HASHER)
    private readonly passwordHasher: PasswordHasher,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Seeds default super admin user if not exists
   */
  async seed(): Promise<void> {
    const email = this.configService.get<string>('seeds.superAdminEmail') ?? 'admin@stayly.dev';
    const password = this.configService.get<string>('seeds.superAdminPassword') ?? 'ChangeMe123!';
    const fullName = this.configService.get<string>('seeds.superAdminName') ?? 'System Super Admin';

    const emailVo = Email.create(email);
    const existing = await this.userRepository.findByEmail(emailVo);
    if (existing) {
      this.logger.log(`Super admin user already exists (${email})`);
      return;
    }

    const roles = await this.roleRepository.findAll();
    const roleMap = new Map(roles.map((role) => [role.getValue(), role]));
    const requiredRoles = [UserRole.SUPER_ADMIN, UserRole.OWNER];
    const assignedRoles: Role[] = [];

    for (const roleCode of requiredRoles) {
      const role = roleMap.get(roleCode);
      if (!role) {
        this.logger.warn(`Role ${roleCode} not found. Skipping default super admin seeding.`);
        return;
      }
      assignedRoles.push(role);
    }

    const permissions: Permission[] = await this.permissionRepository.findAll();
    const hashedPassword = await this.passwordHasher.hash(password);

    const user = User.create({
      id: UserId.create(randomUUID()),
      email: emailVo,
      fullName,
      passwordHash: PasswordHash.create(hashedPassword),
      roles: assignedRoles,
      permissions,
    });

    await this.userRepository.save(user);
    this.logger.log(`Seeded default super admin account (${email}). Remember to rotate the seeded password.`);
  }
}

