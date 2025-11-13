/**
 * PermissionsController exposes endpoints for permission management and assignment
 */
import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
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
// Using string literals for decorator (decorator accepts string[])
import { ListPermissionsQuery } from '../../application/queries/list-permissions.query';
import { AssignPermissionsToUserCommand } from '../../application/commands/assign-permissions-to-user.command';
import { AssignPermissionsToUserDto } from '../../application/dto/request/assign-permissions-to-user.dto';
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
   * Assigns permissions to a user
   */
  @Patch('users/:userId')
  @Roles('super_admin')
  @Permissions('permission:assign')
  @ApiOperation({ summary: 'Assign permissions to user' })
  @ApiParam({
    name: 'userId',
    description: 'User unique identifier',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiBody({ type: AssignPermissionsToUserDto })
  @ApiResponse({
    status: 200,
    description: 'Permissions assigned successfully',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request - validation failed' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  async assignPermissionsToUser(
    @Param('userId') userId: string,
    @Body() dto: AssignPermissionsToUserDto,
  ): Promise<UserResponseDto> {
    const command = new AssignPermissionsToUserCommand(userId, dto.permissions);
    return this.commandBus.execute(command);
  }
}

