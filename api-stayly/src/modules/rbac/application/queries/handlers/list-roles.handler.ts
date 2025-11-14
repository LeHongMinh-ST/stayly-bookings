/**
 * ListRolesHandler retrieves all roles from catalog
 */
import { Inject, Injectable } from "@nestjs/common";
import { QueryHandler, IQueryHandler } from "@nestjs/cqrs";
import { ListRolesQuery } from "../list-roles.query";
import type { IRoleRepository } from "../../../domain/repositories/role.repository.interface";
import { ROLE_REPOSITORY } from "../../../domain/repositories/role.repository.interface";
import { RoleResponseDto } from "../../dto/response/role-response.dto";

@Injectable()
@QueryHandler(ListRolesQuery)
export class ListRolesHandler
  implements IQueryHandler<ListRolesQuery, RoleResponseDto[]>
{
  constructor(
    @Inject(ROLE_REPOSITORY)
    private readonly roleRepository: IRoleRepository,
  ) {}

  /**
   * Executes query to retrieve all roles
   */
  async execute(): Promise<RoleResponseDto[]> {
    const roles = await this.roleRepository.findAll();
    return roles.map((role) => RoleResponseDto.fromDomain(role));
  }
}
