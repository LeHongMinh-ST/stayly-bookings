/**
 * User Management Module
 * Provides user administration capabilities for staff roles
 */

import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SecurityModule } from '../../common/infrastructure/security/security.module';
import { CreateUserHandler } from './application/commands/handlers/create-user.handler';
import { AssignRolesHandler } from './application/commands/handlers/assign-roles.handler';
import { UpdateUserStatusHandler } from './application/commands/handlers/update-user-status.handler';
import { GetUserHandler } from './application/queries/handlers/get-user.handler';
import { ListUsersHandler } from './application/queries/handlers/list-users.handler';
import { USER_REPOSITORY } from './domain/repositories/user.repository.interface';
import { ROLE_REPOSITORY } from './domain/repositories/role.repository.interface';
import { PERMISSION_REPOSITORY } from './domain/repositories/permission.repository.interface';
import { UserRepository } from './infrastructure/persistence/repositories/user.repository';
import { RoleRepository } from './infrastructure/persistence/repositories/role.repository';
import { PermissionRepository } from './infrastructure/persistence/repositories/permission.repository';
import { RolePermissionSeedService } from './infrastructure/persistence/seeds/role-permission-seed.service';
import { DefaultUsersSeedService } from './infrastructure/persistence/seeds/default-users-seed.service';
import { UsersController } from './presentation/controllers/users.controller';
import { UserOrmEntity } from './infrastructure/persistence/entities/user.orm-entity';
import { RoleOrmEntity } from './infrastructure/persistence/entities/role.orm-entity';
import { PermissionOrmEntity } from './infrastructure/persistence/entities/permission.orm-entity';
import { UserAuthenticationService, USER_AUTHENTICATION_SERVICE } from './infrastructure/services/user-authentication.service';

const commandHandlers = [
  CreateUserHandler,
  AssignRolesHandler,
  UpdateUserStatusHandler,
];

const queryHandlers = [GetUserHandler, ListUsersHandler];

@Module({
  imports: [
    CqrsModule,
    SecurityModule,
    TypeOrmModule.forFeature([UserOrmEntity, RoleOrmEntity, PermissionOrmEntity]),
  ],
  controllers: [UsersController],
  providers: [
    ...commandHandlers,
    ...queryHandlers,
    { provide: USER_REPOSITORY, useClass: UserRepository },
    { provide: ROLE_REPOSITORY, useClass: RoleRepository },
    { provide: PERMISSION_REPOSITORY, useClass: PermissionRepository },
    // Services for other modules
    {
      provide: USER_AUTHENTICATION_SERVICE,
      useClass: UserAuthenticationService,
    },
    // Seed services for CLI usage (they won't auto-run on bootstrap)
    RolePermissionSeedService,
    DefaultUsersSeedService,
  ],
  exports: [
    USER_REPOSITORY,
    ROLE_REPOSITORY,
    PERMISSION_REPOSITORY,
    USER_AUTHENTICATION_SERVICE, // Export service for other modules
  ],
})
export class UserModule {}
