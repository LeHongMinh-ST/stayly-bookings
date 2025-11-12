/**
 * UsersController exposes administrative endpoints for staff accounts
 */
import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { Roles } from '../../../../common/decorators/roles.decorator';
import { Permissions } from '../../../../common/decorators/permissions.decorator';
import { CreateUserDto } from '../../application/dto/create-user.dto';
import { CreateUserCommand } from '../../application/commands/create-user.command';
import { UserResponseDto } from '../../application/dto/user-response.dto';
import { ListUsersQuery } from '../../application/queries/list-users.query';
import { UserCollectionDto } from '../../application/dto/user-collection.dto';
import { GetUserQuery } from '../../application/queries/get-user.query';
import { UpdateUserStatusDto } from '../../application/dto/update-user-status.dto';
import { UpdateUserStatusCommand } from '../../application/commands/update-user-status.command';
import { AssignRolesDto } from '../../application/dto/assign-roles.dto';
import { AssignRolesCommand } from '../../application/commands/assign-roles.command';
import { UserRole } from '../../domain/value-objects/role.vo';

@Controller('api/v1/admin/users')
export class UsersController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  /**
   * Creates a new administrative user with specified roles and permissions
   */
  @Post()
  @Roles(UserRole.SUPER_ADMIN, UserRole.OWNER)
  @Permissions('user:manage')
  async createUser(@Body() dto: CreateUserDto): Promise<UserResponseDto> {
    const command = new CreateUserCommand(
      dto.email,
      dto.password,
      dto.fullName,
      dto.roles,
      dto.permissions ?? [],
    );
    return this.commandBus.execute(command);
  }

  /**
   * Lists users with pagination support
   */
  @Get()
  @Roles(UserRole.SUPER_ADMIN, UserRole.OWNER, UserRole.MANAGER)
  @Permissions('user:read')
  async listUsers(
    @Query('limit', new ParseIntPipe({ optional: true })) limit = 20,
    @Query('offset', new ParseIntPipe({ optional: true })) offset = 0,
  ): Promise<UserCollectionDto> {
    return this.queryBus.execute(new ListUsersQuery(limit, offset));
  }

  /**
   * Retrieves a single user by identifier
   */
  @Get(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.OWNER, UserRole.MANAGER)
  @Permissions('user:read')
  async getUser(@Param('id') id: string): Promise<UserResponseDto> {
    return this.queryBus.execute(new GetUserQuery(id));
  }

  /**
   * Updates user lifecycle status
   */
  @Patch(':id/status')
  @Roles(UserRole.SUPER_ADMIN, UserRole.OWNER)
  @Permissions('user:manage')
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateUserStatusDto,
  ): Promise<UserResponseDto> {
    const command = new UpdateUserStatusCommand(id, dto.status);
    return this.commandBus.execute(command);
  }

  /**
   * Assigns roles to a user
   */
  @Patch(':id/roles')
  @Roles(UserRole.SUPER_ADMIN)
  @Permissions('user:manage')
  async assignRoles(
    @Param('id') id: string,
    @Body() dto: AssignRolesDto,
  ): Promise<UserResponseDto> {
    const command = new AssignRolesCommand(id, dto.roles);
    return this.commandBus.execute(command);
  }
}
