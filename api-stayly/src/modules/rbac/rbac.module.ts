/**
 * RBAC Module
 * Manages roles and permissions catalog, and role/permission assignment to users
 */

import { Module, forwardRef } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from '../user/user.module';
import { AssignRolesToUserHandler } from './application/commands/handlers/assign-roles-to-user.handler';
import { AssignPermissionsToUserHandler } from './application/commands/handlers/assign-permissions-to-user.handler';
import { CreateRoleHandler } from './application/commands/handlers/create-role.handler';
import { UpdateRoleHandler } from './application/commands/handlers/update-role.handler';
import { DeleteRoleHandler } from './application/commands/handlers/delete-role.handler';
import { AssignPermissionsToRoleHandler } from './application/commands/handlers/assign-permissions-to-role.handler';
import { ListRolesHandler } from './application/queries/handlers/list-roles.handler';
import { ListPermissionsHandler } from './application/queries/handlers/list-permissions.handler';
import { GetRoleHandler } from './application/queries/handlers/get-role.handler';
import { ROLE_REPOSITORY } from './domain/repositories/role.repository.interface';
import { PERMISSION_REPOSITORY } from './domain/repositories/permission.repository.interface';
import { RoleRepository } from './infrastructure/persistence/repositories/role.repository';
import { PermissionRepository } from './infrastructure/persistence/repositories/permission.repository';
import { RoleOrmEntity } from './infrastructure/persistence/entities/role.orm-entity';
import { PermissionOrmEntity } from './infrastructure/persistence/entities/permission.orm-entity';
import { RolePermissionSeedService } from './infrastructure/persistence/seeds/role-permission-seed.service';
import { RoleAssignmentService } from './infrastructure/services/role-assignment.service';
import { PermissionAssignmentService } from './infrastructure/services/permission-assignment.service';
import { RolePermissionValidationService } from './infrastructure/services/role-permission-validation.service';
import { UserRolePermissionQueryService } from './infrastructure/services/user-role-permission-query.service';
import { UserRoleLinkService } from './infrastructure/services/user-role-link.service';
import { UserPermissionLinkService } from './infrastructure/services/user-permission-link.service';
import { ROLE_ASSIGNMENT_PORT } from './application/interfaces/role-assignment.port';
import { PERMISSION_ASSIGNMENT_PORT } from './application/interfaces/permission-assignment.port';
import { ROLE_PERMISSION_VALIDATION_PORT } from './application/interfaces/role-permission-validation.port';
import { USER_ROLE_PERMISSION_QUERY_PORT } from './application/interfaces/user-role-permission-query.port';
import { USER_ROLE_LINK_PORT } from './application/interfaces/user-role-link.port';
import { USER_PERMISSION_LINK_PORT } from './application/interfaces/user-permission-link.port';
import { RolesController } from './presentation/controllers/roles.controller';
import { PermissionsController } from './presentation/controllers/permissions.controller';
import { UserOrmEntity } from '../user/infrastructure/persistence/entities/user.orm-entity';

const commandHandlers = [
  AssignRolesToUserHandler,
  AssignPermissionsToUserHandler,
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
  controllers: [RolesController, PermissionsController],
  providers: [
    ...commandHandlers,
    ...queryHandlers,
    { provide: ROLE_REPOSITORY, useClass: RoleRepository },
    { provide: PERMISSION_REPOSITORY, useClass: PermissionRepository },
    // Port implementations for other modules
    {
      provide: ROLE_ASSIGNMENT_PORT,
      useClass: RoleAssignmentService,
    },
    {
      provide: PERMISSION_ASSIGNMENT_PORT,
      useClass: PermissionAssignmentService,
    },
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
    ROLE_ASSIGNMENT_PORT,
    PERMISSION_ASSIGNMENT_PORT,
    ROLE_PERMISSION_VALIDATION_PORT, // Export port for User module to validate roles/permissions
    USER_ROLE_PERMISSION_QUERY_PORT, // Export port for Auth module to query user roles/permissions
    USER_ROLE_LINK_PORT,
    USER_PERMISSION_LINK_PORT,
  ],
})
export class RbacModule {}
