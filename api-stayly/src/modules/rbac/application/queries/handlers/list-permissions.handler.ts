/**
 * ListPermissionsHandler retrieves all permissions from catalog with pagination
 */
import { Inject, Injectable } from "@nestjs/common";
import { QueryHandler, IQueryHandler } from "@nestjs/cqrs";
import { ListPermissionsQuery } from "../list-permissions.query";
import type { IPermissionRepository } from "../../../domain/repositories/permission.repository.interface";
import { PERMISSION_REPOSITORY } from "../../../domain/repositories/permission.repository.interface";
import { PermissionResponseDto } from "../../../application/dto/response/permission-response.dto";
import { PermissionCollectionDto } from "../../../application/dto/response/permission-collection.dto";

@Injectable()
@QueryHandler(ListPermissionsQuery)
export class ListPermissionsHandler
  implements IQueryHandler<ListPermissionsQuery, PermissionCollectionDto>
{
  constructor(
    @Inject(PERMISSION_REPOSITORY)
    private readonly permissionRepository: IPermissionRepository,
  ) {}

  /**
   * Executes query to retrieve paginated permissions
   */
  async execute(query: ListPermissionsQuery): Promise<PermissionCollectionDto> {
    // Validate and normalize pagination params using common helper
    const { page, limit, offset } = query.normalize();

    const [permissions, total] = await Promise.all([
      this.permissionRepository.findAll(limit, offset, query.search),
      this.permissionRepository.count(query.search),
    ]);

    const data = permissions.map((permission) =>
      PermissionResponseDto.fromValueObject(permission),
    );
    return new PermissionCollectionDto(data, total, limit, page);
  }
}
