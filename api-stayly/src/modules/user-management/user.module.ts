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
import { RolePermissionSeeder } from './infrastructure/persistence/seeds/role-permission.seeder';
import { DefaultUsersSeeder } from './infrastructure/persistence/seeds/default-users.seeder';
import { UsersController } from './presentation/controllers/users.controller';
import { UserOrmEntity } from './infrastructure/persistence/entities/user.orm-entity';
import { RoleOrmEntity } from './infrastructure/persistence/entities/role.orm-entity';
import { PermissionOrmEntity } from './infrastructure/persistence/entities/permission.orm-entity';

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
    RolePermissionSeeder,
    DefaultUsersSeeder,
  ],
  exports: [USER_REPOSITORY, ROLE_REPOSITORY, PERMISSION_REPOSITORY],
})
export class UserManagementModule {}
