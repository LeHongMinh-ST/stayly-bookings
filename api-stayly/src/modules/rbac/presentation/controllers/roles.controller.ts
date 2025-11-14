/**
 * RolesController exposes endpoints for role management and assignment
 */
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { JwtUserGuard } from '../../../../common/guards/jwt-user.guard';
import { Roles } from '../../../../common/decorators/roles.decorator';
import { Permissions } from '../../../../common/decorators/permissions.decorator';
import { ListRolesQuery } from '../../application/queries/list-roles.query';
import { GetRoleQuery } from '../../application/queries/get-role.query';
import { CreateRoleCommand } from '../../application/commands/create-role.command';
import { UpdateRoleCommand } from '../../application/commands/update-role.command';
import { DeleteRoleCommand } from '../../application/commands/delete-role.command';
import { AssignPermissionsToRoleCommand } from '../../application/commands/assign-permissions-to-role.command';
import { CreateRoleDto } from '../../application/dto/request/create-role.dto';
import { UpdateRoleDto } from '../../application/dto/request/update-role.dto';
import { AssignPermissionsToRoleDto } from '../../application/dto/request/assign-permissions-to-role.dto';
import { RoleResponseDto } from '../../application/dto/response/role-response.dto';

@ApiTags('roles')
@UseGuards(JwtUserGuard)
@ApiBearerAuth('JWT-auth')
@Controller('v1/rbac/roles')
export class RolesController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  /**
   * Lists all available roles
   */
  @Get()
  @Permissions('role:read')
  @ApiOperation({ summary: 'List all roles' })
  @ApiResponse({
    status: 200,
    description: 'Returns list of all roles',
    type: [RoleResponseDto],
  })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  async listRoles(): Promise<RoleResponseDto[]> {
    return this.queryBus.execute(new ListRolesQuery());
  }

  /**
   * Creates a new role
   */
  @Post()
  @Permissions('role:create')
  @ApiOperation({ summary: 'Create a new role' })
  @ApiBody({ type: CreateRoleDto })
  @ApiResponse({
    status: 201,
    description: 'Role successfully created',
    type: RoleResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request - validation failed' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  async createRole(@Body() dto: CreateRoleDto): Promise<RoleResponseDto> {
    const command = new CreateRoleCommand(dto.displayName, dto.permissions);
    return this.commandBus.execute(command);
  }
  /**
   * Gets a single role by ID
   */
  @Get(':id')
  @Permissions('role:read')
  @ApiOperation({ summary: 'Get role by ID' })
  @ApiParam({
    name: 'id',
    description: 'Role unique identifier',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns role details',
    type: RoleResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Role not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  async getRole(@Param('id') id: string): Promise<RoleResponseDto> {
    return this.queryBus.execute(new GetRoleQuery(id));
  }

  /**
   * Updates a role
   */
  @Patch(':id')
  @Permissions('role:update')
  @ApiOperation({ summary: 'Update a role' })
  @ApiParam({
    name: 'id',
    description: 'Role unique identifier',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiBody({ type: UpdateRoleDto })
  @ApiResponse({
    status: 200,
    description: 'Role successfully updated',
    type: RoleResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request - validation failed' })
  @ApiResponse({ status: 404, description: 'Role not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  async updateRole(
    @Param('id') id: string,
    @Body() dto: UpdateRoleDto,
  ): Promise<RoleResponseDto> {
    const command = new UpdateRoleCommand(id, dto.displayName);
    return this.commandBus.execute(command);
  }

  /**
   * Deletes a role
   */
  @Delete(':id')
  @Roles('super_admin')
  @Permissions('role:delete')
  @ApiOperation({ summary: 'Delete a role' })
  @ApiParam({
    name: 'id',
    description: 'Role unique identifier',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Role successfully deleted',
  })
  @ApiResponse({ status: 400, description: 'Bad request - cannot delete super admin role' })
  @ApiResponse({ status: 404, description: 'Role not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  async deleteRole(@Param('id') id: string): Promise<void> {
    const command = new DeleteRoleCommand(id);
    return this.commandBus.execute(command);
  }

  /**
   * Assigns permissions to a role
   */
  @Patch(':id/permissions')
  @Roles('super_admin')
  @Permissions('role:update')
  @ApiOperation({ summary: 'Assign permissions to a role' })
  @ApiParam({
    name: 'id',
    description: 'Role unique identifier',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiBody({ type: AssignPermissionsToRoleDto })
  @ApiResponse({
    status: 200,
    description: 'Permissions assigned successfully',
    type: RoleResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request - validation failed' })
  @ApiResponse({ status: 404, description: 'Role not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  async assignPermissionsToRole(
    @Param('id') id: string,
    @Body() dto: AssignPermissionsToRoleDto,
  ): Promise<RoleResponseDto> {
    const command = new AssignPermissionsToRoleCommand(id, dto.permissions);
    return this.commandBus.execute(command);
  }
}

