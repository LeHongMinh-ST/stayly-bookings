/**
 * PermissionsController exposes endpoints for permission management and assignment
 */
import { Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { JwtUserGuard } from '../../../../common/guards/jwt-user.guard';
import { Roles } from '../../../../common/decorators/roles.decorator';
import { Permissions } from '../../../../common/decorators/permissions.decorator';
// Using string literals for decorator (decorator accepts string[])
import { ListPermissionsQuery } from '../../application/queries/list-permissions.query';
import { AssignPermissionToUserCommand } from '../../application/commands/assign-permission-to-user.command';
import { UnassignPermissionFromUserCommand } from '../../application/commands/unassign-permission-from-user.command';
import { PermissionResponseDto } from '../../application/dto/response/permission-response.dto';
import { UserResponseDto } from '../../../user/application/dto/response/user-response.dto';

@ApiTags('permissions')
@UseGuards(JwtUserGuard)
@ApiBearerAuth('JWT-auth')
@Controller('v1/admin/permissions')
export class PermissionsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  /**
   * Lists all available permissions
   */
  @Get()
  @Roles('super_admin', 'owner', 'manager')
  @Permissions('permission:read')
  @ApiOperation({ summary: 'List all permissions' })
  @ApiResponse({
    status: 200,
    description: 'Returns list of all permissions',
    type: [PermissionResponseDto],
  })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  async listPermissions(): Promise<PermissionResponseDto[]> {
    const permissions = await this.queryBus.execute(new ListPermissionsQuery());
    return permissions.map((permission) =>
      PermissionResponseDto.fromValueObject(permission),
    );
  }

  /**
   * Assigns a single permission to a user
   */
  @Post(':permissionId/users/:userId')
  @Roles('super_admin')
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
    @Param('permissionId') permissionId: string,
    @Param('userId') userId: string,
  ): Promise<UserResponseDto> {
    const command = new AssignPermissionToUserCommand(permissionId, userId);
    return this.commandBus.execute(command);
  }

  /**
   * Unassigns a single permission from a user
   */
  @Delete(':permissionId/users/:userId')
  @Roles('super_admin')
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
    @Param('permissionId') permissionId: string,
    @Param('userId') userId: string,
  ): Promise<UserResponseDto> {
    const command = new UnassignPermissionFromUserCommand(permissionId, userId);
    return this.commandBus.execute(command);
  }
}

