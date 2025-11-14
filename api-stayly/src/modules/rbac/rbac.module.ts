/**
 * RBAC Module
 * Manages roles and permissions catalog, and role/permission assignment to users
 */

import { Module, forwardRef } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from '../user/user.module';
import { AssignRoleToUserHandler } from './application/commands/handlers/assign-role-to-user.handler';
import { UnassignRoleFromUserHandler } from './application/commands/handlers/unassign-role-from-user.handler';
import { AssignPermissionToUserHandler } from './application/commands/handlers/assign-permission-to-user.handler';
import { UnassignPermissionFromUserHandler } from './application/commands/handlers/unassign-permission-from-user.handler';
import { CreateRoleHandler } from './application/commands/handlers/create-role.handler';
import { UpdateRoleHandler } from './application/commands/handlers/update-role.handler';
import { DeleteRoleHandler } from './application/commands/handlers/delete-role.handler';
import { AssignPermissionsToRoleHandler } from './application/commands/handlers/assign-permissions-to-role.handler';
import { ListRolesHandler } from './application/queries/handlers/list-roles.handler';
import { ListPermissionsHandler } from './application/queries/handlers/list-permissions.handler';
import { ROLE_REPOSITORY } from './domain/repositories/role.repository.interface';
import { PERMISSION_REPOSITORY } from './domain/repositories/permission.repository.interface';
import { RoleRepository } from './infrastructure/persistence/repositories/role.repository';
import { PermissionRepository } from './infrastructure/persistence/repositories/permission.repository';
import { RoleOrmEntity } from './infrastructure/persistence/entities/role.orm-entity';
import { PermissionOrmEntity } from './infrastructure/persistence/entities/permission.orm-entity';
import { RolePermissionSeedService } from './infrastructure/persistence/seeds/role-permission-seed.service';
import { RolePermissionValidationService } from './infrastructure/services/role-permission-validation.service';
import { UserRolePermissionQueryService } from './infrastructure/services/user-role-permission-query.service';
import { UserRoleLinkService } from './infrastructure/services/user-role-link.service';
import { UserPermissionLinkService } from './infrastructure/services/user-permission-link.service';
import { ROLE_PERMISSION_VALIDATION_PORT } from './application/interfaces/role-permission-validation.port';
import { USER_ROLE_PERMISSION_QUERY_PORT } from './application/interfaces/user-role-permission-query.port';
import { USER_ROLE_LINK_PORT } from './application/interfaces/user-role-link.port';
import { USER_PERMISSION_LINK_PORT } from './application/interfaces/user-permission-link.port';
import { RolesController } from './presentation/controllers/roles.controller';
import { PermissionsController } from './presentation/controllers/permissions.controller';
import { UserOrmEntity } from '../user/infrastructure/persistence/entities/user.orm-entity';
import { RbacAssignController } from './presentation/controllers/assign.constoller';

const commandHandlers = [
  CreateRoleHandler,
  UpdateRoleHandler,
  DeleteRoleHandler,
  AssignPermissionsToRoleHandler,
  AssignRoleToUserHandler,
  UnassignRoleFromUserHandler,
  AssignPermissionToUserHandler,
  UnassignPermissionFromUserHandler,
];

const queryHandlers = [ListRolesHandler, ListPermissionsHandler];

@Module({
  imports: [
    CqrsModule,
    forwardRef(() => UserModule), // Import UserModule to access USER_REPOSITORY port (forwardRef to avoid circular dependency)
    TypeOrmModule.forFeature([
      RoleOrmEntity,
      PermissionOrmEntity, // Needed for RoleRepository to load permissions
      UserOrmEntity,
    ]),
  ],
  controllers: [RolesController, PermissionsController, RbacAssignController],
  providers: [
    ...commandHandlers,
    ...queryHandlers,
    { provide: ROLE_REPOSITORY, useClass: RoleRepository },
    { provide: PERMISSION_REPOSITORY, useClass: PermissionRepository },
    // Port implementations for other modules
    {
      provide: ROLE_PERMISSION_VALIDATION_PORT,
      useClass: RolePermissionValidationService,
    },
    {
      provide: USER_ROLE_PERMISSION_QUERY_PORT,
      useClass: UserRolePermissionQueryService,
    },
    {
      provide: USER_ROLE_LINK_PORT,
      useClass: UserRoleLinkService,
    },
    {
      provide: USER_PERMISSION_LINK_PORT,
      useClass: UserPermissionLinkService,
    },
    // Seed service for CLI usage
    RolePermissionSeedService,
  ],
  exports: [
    ROLE_REPOSITORY,
    PERMISSION_REPOSITORY,
    ROLE_PERMISSION_VALIDATION_PORT, // Export port for User module to validate roles/permissions
    USER_ROLE_PERMISSION_QUERY_PORT, // Export port for Auth module to query user roles/permissions
    USER_ROLE_LINK_PORT,
    USER_PERMISSION_LINK_PORT,
  ],
})
export class RbacModule {}
