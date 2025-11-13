/**
 * DefaultUsersSeedService provides seeding logic for default admin user
 */
import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';
import type { IUserRepository } from '../../../domain/repositories/user.repository.interface';
import { USER_REPOSITORY } from '../../../domain/repositories/user.repository.interface';
import type { IRoleRepository } from '../../../../rbac/domain/repositories/role.repository.interface';
import { ROLE_REPOSITORY } from '../../../../rbac/domain/repositories/role.repository.interface';
import type { IPermissionRepository } from '../../../../rbac/domain/repositories/permission.repository.interface';
import { PERMISSION_REPOSITORY } from '../../../../rbac/domain/repositories/permission.repository.interface';
import type { PasswordHasher } from '../../../../../common/application/interfaces/password-hasher.interface';
import { PASSWORD_HASHER } from '../../../../../common/application/interfaces/password-hasher.interface';
import { Email } from '../../../../../common/domain/value-objects/email.vo';
import { PasswordHash } from '../../../../../common/domain/value-objects/password-hash.vo';
import { User } from '../../../domain/entities/user.entity';
import { UserId } from '../../../domain/value-objects/user-id.vo';
import { UserRole, UserRoleEnum } from '../../../domain/value-objects/user-role.vo';

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
    const email =
      this.configService.get<string>('seeds.superAdminEmail') ??
      'admin@stayly.dev';
    const password =
      this.configService.get<string>('seeds.superAdminPassword') ??
      'ChangeMe123!';
    const fullName =
      this.configService.get<string>('seeds.superAdminName') ??
      'System Super Admin';

    const emailVo = Email.create(email);
    const existing = await this.userRepository.findByEmail(emailVo);
    if (existing) {
      this.logger.log(`Super admin user already exists (${email})`);
      return;
    }

    // Validate against RBAC catalog
    const roles = await this.roleRepository.findAll();
    const roleMap = new Map<string, typeof roles[0]>(roles.map((role) => [role.getCode(), role]));
    const superAdminRoleFromCatalog = roleMap.get(UserRoleEnum.SUPER_ADMIN);

    if (!superAdminRoleFromCatalog) {
      this.logger.warn(
        'Super admin role not found. Skipping default super admin seeding.',
      );
      return;
    }

    // Convert to local UserRole value object
    const superAdminRole = UserRole.create(UserRoleEnum.SUPER_ADMIN);

    // Super admin automatically has full permissions via PermissionsGuard
    // No need to assign permissions explicitly
    const hashedPassword = await this.passwordHasher.hash(password);

    const user = User.create({
      id: UserId.create(randomUUID()),
      email: emailVo,
      fullName,
      passwordHash: PasswordHash.create(hashedPassword),
      roles: [superAdminRole],
      permissions: [], // Super admin has automatic full access, no permissions needed
    });

    await this.userRepository.save(user);
    this.logger.log(
      `Seeded default super admin account (${email}). Remember to rotate the seeded password.`,
    );
  }
}
