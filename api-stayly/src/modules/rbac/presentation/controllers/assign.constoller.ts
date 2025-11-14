import { Controller, Delete, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UserResponseDto } from 'src/modules/user/application/dto/response/user-response.dto';
import { AssignPermissionToUserCommand } from '../../application/commands/assign-permission-to-user.command';
import { Permissions } from '../../../../common/decorators/permissions.decorator';
import { CommandBus } from '@nestjs/cqrs';
import { AssignRoleToUserCommand } from '../../application/commands/assign-role-to-user.command';
import { JwtUserGuard } from 'src/common/guards/jwt-user.guard';
import { UnassignRoleFromUserCommand } from '../../application/commands/unassign-role-from-user.command';
import { UnassignPermissionFromUserCommand } from '../../application/commands/unassign-permission-from-user.command';

@Controller('v1/rbac/assign')
@ApiTags('rbac assign')
@UseGuards(JwtUserGuard)
@ApiBearerAuth('JWT-auth')
export class RbacAssignController {
  constructor(
    private readonly commandBus: CommandBus,
  ) { }

  /**
   * Assigns a single permission to a user
   */
  @Post(':userId/permisisons/:permissionId')
  @Permissions('permission:assign')
  @ApiOperation({ summary: 'Assign a single permission to user' })
  @ApiParam({
    name: 'permissionId',
    description: 'Permission unique identifier',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiParam({
    name: 'userId',
    description: 'User unique identifier',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Permission assigned successfully',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request - validation failed' })
  @ApiResponse({ status: 404, description: 'Permission or user not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  async assignPermissionToUser(
    @Param('userId') userId: string,
    @Param('permissionId') permissionId: string,
  ): Promise<UserResponseDto> {
    const command = new AssignPermissionToUserCommand(permissionId, userId);
    return this.commandBus.execute(command);
  }

  /**
   * Assigns a single role to a user
   */
  @Post(':userId/role/:roleId')
  @Permissions('role:assign')
  @ApiOperation({ summary: 'Assign a single role to user' })
  @ApiParam({
    name: 'roleId',
    description: 'Role unique identifier',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiParam({
    name: 'userId',
    description: 'User unique identifier',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Role assigned successfully',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request - validation failed' })
  @ApiResponse({ status: 404, description: 'Role or user not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  async assignRoleToUser(
    @Param('userId') userId: string,
    @Param('roleId') roleId: string,
  ): Promise<UserResponseDto> {
    const command = new AssignRoleToUserCommand(roleId, userId);
    return this.commandBus.execute(command);
  }

  /**
   * Unassigns a single role from a user
   */
  @Delete(':userId/role/:roleId')
  @Permissions('role:assign')
  @ApiOperation({ summary: 'Unassign a single role from user' })
  @ApiParam({
    name: 'roleId',
    description: 'Role unique identifier',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiParam({
    name: 'userId',
    description: 'User unique identifier',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Role unassigned successfully',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request - validation failed' })
  @ApiResponse({ status: 404, description: 'Role or user not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  async unassignRoleFromUser(
    @Param('roleId') roleId: string,
    @Param('userId') userId: string,
  ): Promise<UserResponseDto> {
    const command = new UnassignRoleFromUserCommand(roleId, userId);
    return this.commandBus.execute(command);
  }

  /**
   * Unassigns a single permission from a user
   */
  @Delete(':userId/users/:permissionId')
  @Permissions('permission:assign')
  @ApiOperation({ summary: 'Unassign a single permission from user' })
  @ApiParam({
    name: 'permissionId',
    description: 'Permission unique identifier',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiParam({
    name: 'userId',
    description: 'User unique identifier',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Permission unassigned successfully',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request - validation failed' })
  @ApiResponse({ status: 404, description: 'Permission or user not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  async unassignPermissionFromUser(
    @Param('userId') userId: string,
    @Param('permissionId') permissionId: string,
  ): Promise<UserResponseDto> {
    const command = new UnassignPermissionFromUserCommand(permissionId, userId);
    return this.commandBus.execute(command);
  }
}
