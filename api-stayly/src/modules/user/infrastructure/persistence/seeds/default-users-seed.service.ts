/**
 * DefaultUsersSeedService provides seeding logic for default admin user
 */
import { Inject, Injectable, Logger } from "@nestjs/common";
import { ModuleRef } from "@nestjs/core";
import { ConfigService } from "@nestjs/config";
import { randomUUID } from "crypto";
import type { IUserRepository } from "../../../domain/repositories/user.repository.interface";
import { USER_REPOSITORY } from "../../../domain/repositories/user.repository.interface";
import type { IRoleRepository } from "../../../../rbac/domain/repositories/role.repository.interface";
import { ROLE_REPOSITORY } from "../../../../rbac/domain/repositories/role.repository.interface";
import type { IUserRoleLinkPort } from "../../../../rbac/application/interfaces/user-role-link.port";
import { USER_ROLE_LINK_PORT } from "../../../../rbac/application/interfaces/user-role-link.port";
import type { PasswordHasher } from "../../../../../common/application/interfaces/password-hasher.interface";
import { PASSWORD_HASHER } from "../../../../../common/application/interfaces/password-hasher.interface";
import { Email } from "../../../../../common/domain/value-objects/email.vo";
import { PasswordHash } from "../../../../../common/domain/value-objects/password-hash.vo";
import { User } from "../../../domain/entities/user.entity";
import { UserId } from "../../../domain/value-objects/user-id.vo";

@Injectable()
export class DefaultUsersSeedService {
  private readonly logger = new Logger(DefaultUsersSeedService.name);

  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    private readonly moduleRef: ModuleRef,
    @Inject(PASSWORD_HASHER)
    private readonly passwordHasher: PasswordHasher,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Seeds default super admin user if not exists
   */
  async seed(): Promise<void> {
    const email =
      this.configService.get<string>("seeds.superAdminEmail") ??
      "admin@stayly.dev";
    const password =
      this.configService.get<string>("seeds.superAdminPassword") ??
      "ChangeMe123!";
    const fullName =
      this.configService.get<string>("seeds.superAdminName") ??
      "System Super Admin";

    const emailVo = Email.create(email);
    const existing = await this.userRepository.findByEmail(emailVo);
    if (existing) {
      this.logger.log(`Super admin user already exists (${email})`);
      return;
    }

    // Validate against RBAC catalog
    const roleRepository = this.moduleRef.get<IRoleRepository>(
      ROLE_REPOSITORY,
      { strict: false },
    );
    const roles = await roleRepository.findAll();
    // Find super admin role by isSuperAdmin flag
    const superAdminRoleFromCatalog = roles.find(
      (role) => role.getIsSuperAdmin() === true,
    );

    if (!superAdminRoleFromCatalog) {
      this.logger.warn(
        "Super admin role not found. Skipping default super admin seeding.",
      );
      return;
    }

    // Create user without roles/permissions (logic handled in RBAC module)
    const hashedPassword = await this.passwordHasher.hash(password);
    const userId = UserId.create(randomUUID());

    const user = User.create({
      id: userId,
      email: emailVo,
      fullName,
      passwordHash: PasswordHash.create(hashedPassword),
    });

    await this.userRepository.save(user);

    // Assign super_admin role via RBAC module port
    // Use ModuleRef to get USER_ROLE_LINK_PORT from application context
    // This avoids circular dependency between UserModule and RbacModule
    // Super admin automatically has full permissions via PermissionsGuard
    // No need to assign permissions explicitly
    const userRoleLink = this.moduleRef.get<IUserRoleLinkPort>(
      USER_ROLE_LINK_PORT,
      { strict: false },
    );
    await userRoleLink.replaceUserRoles(userId.getValue(), [
      superAdminRoleFromCatalog.getId().getValue(),
    ]);

    this.logger.log(
      `Seeded default super admin account (${email}). Remember to rotate the seeded password.`,
    );
  }
}
