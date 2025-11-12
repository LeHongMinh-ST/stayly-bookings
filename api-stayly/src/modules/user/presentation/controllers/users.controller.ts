/**
 * UsersController exposes administrative endpoints for staff accounts
 */
import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody, ApiParam, ApiQuery } from '@nestjs/swagger';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { JwtUserGuard } from '../../../../common/guards/jwt-user.guard';
import { Roles } from '../../../../common/decorators/roles.decorator';
import { Permissions } from '../../../../common/decorators/permissions.decorator';
import { CreateUserDto } from '../../application/dto/request/create-user.dto';
import { CreateUserCommand } from '../../application/commands/create-user.command';
import { UserResponseDto } from '../../application/dto/response/user-response.dto';
import { ListUsersQuery } from '../../application/queries/list-users.query';
import { UserCollectionDto } from '../../application/dto/response/user-collection.dto';
import { GetUserQuery } from '../../application/queries/get-user.query';
import { UpdateUserStatusDto } from '../../application/dto/request/update-user-status.dto';
import { UpdateUserStatusCommand } from '../../application/commands/update-user-status.command';
import { AssignRolesDto } from '../../application/dto/request/assign-roles.dto';
import { AssignRolesCommand } from '../../application/commands/assign-roles.command';
import { UserRole } from '../../domain/value-objects/role.vo';

@ApiTags('users')
@UseGuards(JwtUserGuard)
@ApiBearerAuth('JWT-auth')
@Controller('v1/admin/users')
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
  @ApiOperation({ summary: 'Create a new administrative user' })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({
    status: 201,
    description: 'User successfully created',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request - validation failed' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
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
  @ApiOperation({ summary: 'List users with pagination' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Number of items per page', example: 20 })
  @ApiQuery({ name: 'offset', required: false, type: Number, description: 'Number of items to skip', example: 0 })
  @ApiResponse({
    status: 200,
    description: 'Returns paginated list of users',
    type: UserCollectionDto,
  })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
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
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiParam({ name: 'id', description: 'User unique identifier', example: '123e4567-e89b-12d3-a456-426614174000' })
  @ApiResponse({
    status: 200,
    description: 'Returns user details',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  async getUser(@Param('id') id: string): Promise<UserResponseDto> {
    return this.queryBus.execute(new GetUserQuery(id));
  }

  /**
   * Updates user lifecycle status
   */
  @Patch(':id/status')
  @Roles(UserRole.SUPER_ADMIN, UserRole.OWNER)
  @Permissions('user:manage')
  @ApiOperation({ summary: 'Update user status' })
  @ApiParam({ name: 'id', description: 'User unique identifier', example: '123e4567-e89b-12d3-a456-426614174000' })
  @ApiBody({ type: UpdateUserStatusDto })
  @ApiResponse({
    status: 200,
    description: 'User status updated successfully',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request - validation failed' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
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
  @ApiOperation({ summary: 'Assign roles to user' })
  @ApiParam({ name: 'id', description: 'User unique identifier', example: '123e4567-e89b-12d3-a456-426614174000' })
  @ApiBody({ type: AssignRolesDto })
  @ApiResponse({
    status: 200,
    description: 'Roles assigned successfully',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request - validation failed' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  async assignRoles(
    @Param('id') id: string,
    @Body() dto: AssignRolesDto,
  ): Promise<UserResponseDto> {
    const command = new AssignRolesCommand(id, dto.roles);
    return this.commandBus.execute(command);
  }
}
