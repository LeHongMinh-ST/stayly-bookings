/**
 * ListPermissionsHandler retrieves all permissions from catalog
 */
import { Inject, Injectable } from '@nestjs/common';
import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { ListPermissionsQuery } from '../list-permissions.query';
import type { IPermissionRepository } from '../../../domain/repositories/permission.repository.interface';
import { PERMISSION_REPOSITORY } from '../../../domain/repositories/permission.repository.interface';
import { Permission } from '../../../domain/value-objects/permission.vo';

@Injectable()
@QueryHandler(ListPermissionsQuery)
export class ListPermissionsHandler
  implements IQueryHandler<ListPermissionsQuery, Permission[]>
{
  constructor(
    @Inject(PERMISSION_REPOSITORY)
    private readonly permissionRepository: IPermissionRepository,
  ) {}

  /**
   * Executes query to retrieve all permissions
   */
  async execute(query: ListPermissionsQuery): Promise<Permission[]> {
    return await this.permissionRepository.findAll();
  }
}
