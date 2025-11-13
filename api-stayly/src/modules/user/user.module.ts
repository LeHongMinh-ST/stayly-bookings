/**
 * User Management Module
 * Provides user administration capabilities for staff roles
 */

import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SecurityModule } from '../../common/infrastructure/security/security.module';
import { CreateUserHandler } from './application/commands/handlers/create-user.handler';
import { UpdateUserStatusHandler } from './application/commands/handlers/update-user-status.handler';
import { GetUserHandler } from './application/queries/handlers/get-user.handler';
import { ListUsersHandler } from './application/queries/handlers/list-users.handler';
import { USER_REPOSITORY } from './domain/repositories/user.repository.interface';
import { UserRepository } from './infrastructure/persistence/repositories/user.repository';
import { DefaultUsersSeedService } from './infrastructure/persistence/seeds/default-users-seed.service';
import { UsersController } from './presentation/controllers/users.controller';
import { UserOrmEntity } from './infrastructure/persistence/entities/user.orm-entity';
import { RoleOrmEntity } from '../rbac/infrastructure/persistence/entities/role.orm-entity';
import { PermissionOrmEntity } from '../rbac/infrastructure/persistence/entities/permission.orm-entity';
import { UserAuthenticationService } from './infrastructure/services/user-authentication.service';
import { USER_AUTHENTICATION_PORT } from './application/interfaces/user-authentication.port';

const commandHandlers = [CreateUserHandler, UpdateUserStatusHandler];

const queryHandlers = [GetUserHandler, ListUsersHandler];

@Module({
  imports: [
    CqrsModule,
    SecurityModule,
    TypeOrmModule.forFeature([
      UserOrmEntity,
      RoleOrmEntity,
      PermissionOrmEntity, // Still need these for UserRepository to load relations
    ]),
  ],
  controllers: [UsersController],
  providers: [
    ...commandHandlers,
    ...queryHandlers,
    { provide: USER_REPOSITORY, useClass: UserRepository },
    // Port implementation for other modules
    // Following Port/Adapter Pattern - export port, not service directly
    {
      provide: USER_AUTHENTICATION_PORT,
      useClass: UserAuthenticationService,
    },
    // Seed services for CLI usage (they won't auto-run on bootstrap)
    DefaultUsersSeedService,
  ],
  exports: [
    USER_REPOSITORY,
    USER_AUTHENTICATION_PORT, // Export port for other modules (Port/Adapter Pattern)
  ],
})
export class UserModule {}
