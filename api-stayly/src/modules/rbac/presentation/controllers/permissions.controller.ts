/**
 * PermissionsController exposes endpoints for permission management and assignment
 */
import {
  Controller,
  Get,
  Query,
  UseGuards,
  ParseIntPipe,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from "@nestjs/swagger";
import { QueryBus } from "@nestjs/cqrs";
import { JwtUserGuard } from "../../../../common/guards/jwt-user.guard";
import { Permissions } from "../../../../common/decorators/permissions.decorator";
import { ListPermissionsQuery } from "../../application/queries/list-permissions.query";
import { PermissionCollectionDto } from "../../application/dto/response/permission-collection.dto";
import {
  DEFAULT_PAGE_SIZE,
  DEFAULT_PAGE_NUMBER,
} from "../../../../common/constants";

@ApiTags("rbac")
@UseGuards(JwtUserGuard)
@ApiBearerAuth("JWT-auth")
@Controller("v1/rbac/permissions")
export class PermissionsController {
  constructor(private readonly queryBus: QueryBus) {}

  /**
   * Lists all available permissions with pagination
   */
  @Get()
  @Permissions("permission:read")
  @ApiOperation({ summary: "List all permissions with pagination" })
  @ApiQuery({
    name: "page",
    required: false,
    type: Number,
    description: "Page number (starts from 1)",
    example: 1,
  })
  @ApiQuery({
    name: "limit",
    required: false,
    type: Number,
    description: "Number of items per page",
    example: 20,
  })
  @ApiQuery({
    name: "search",
    required: false,
    type: String,
    description: "Search term for filtering permissions",
  })
  @ApiResponse({
    status: 200,
    description: "Returns paginated list of permissions",
    type: PermissionCollectionDto,
  })
  @ApiResponse({
    status: 403,
    description: "Forbidden - insufficient permissions",
  })
  async listPermissions(
    @Query("page", new ParseIntPipe({ optional: true }))
    page: number = DEFAULT_PAGE_NUMBER,
    @Query("limit", new ParseIntPipe({ optional: true }))
    limit: number = DEFAULT_PAGE_SIZE,
    @Query("search") search?: string,
  ): Promise<PermissionCollectionDto> {
    return this.queryBus.execute(
      new ListPermissionsQuery(search || "", page, limit),
    );
  }
}
