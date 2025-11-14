/**
 * ListRolesHandler retrieves all roles from catalog with pagination
 */
import { Inject, Injectable } from "@nestjs/common";
import { QueryHandler, IQueryHandler } from "@nestjs/cqrs";
import { ListRolesQuery } from "../list-roles.query";
import type { IRoleRepository } from "../../../domain/repositories/role.repository.interface";
import { ROLE_REPOSITORY } from "../../../domain/repositories/role.repository.interface";
import { RoleResponseDto } from "../../dto/response/role-response.dto";
import { RoleCollectionDto } from "../../dto/response/role-collection.dto";

@Injectable()
@QueryHandler(ListRolesQuery)
export class ListRolesHandler
  implements IQueryHandler<ListRolesQuery, RoleCollectionDto>
{
  constructor(
    @Inject(ROLE_REPOSITORY)
    private readonly roleRepository: IRoleRepository,
  ) {}

  /**
   * Executes query to retrieve paginated roles
   */
  async execute(query: ListRolesQuery): Promise<RoleCollectionDto> {
    // Validate and normalize pagination params using common helper
    const { page, limit, offset } = query.normalize();

    const [roles, total] = await Promise.all([
      this.roleRepository.findAll(limit, offset),
      this.roleRepository.count(),
    ]);

    const data = roles.map((role) => RoleResponseDto.fromDomain(role));
    return new RoleCollectionDto(data, total, limit, page);
  }
}
