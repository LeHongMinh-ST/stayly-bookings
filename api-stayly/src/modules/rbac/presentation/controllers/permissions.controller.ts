/**
 * PermissionsController exposes endpoints for permission management and assignment
 */
import { Controller, Get, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { JwtUserGuard } from '../../../../common/guards/jwt-user.guard';
import { Roles } from '../../../../common/decorators/roles.decorator';
import { Permissions } from '../../../../common/decorators/permissions.decorator';
import { ListPermissionsQuery } from '../../application/queries/list-permissions.query';
import { PermissionResponseDto } from '../../application/dto/response/permission-response.dto';
import { Permission } from '../../domain/value-objects/permission.vo';

@ApiTags('permissions')
@UseGuards(JwtUserGuard)
@ApiBearerAuth('JWT-auth')
@Controller('v1/rbac/permissions')
export class PermissionsController {
  constructor(
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
    const permissions: Permission[] = await this.queryBus.execute(new ListPermissionsQuery());
    return permissions.map((permission) =>
      PermissionResponseDto.fromValueObject(permission),
    );
  }
}

