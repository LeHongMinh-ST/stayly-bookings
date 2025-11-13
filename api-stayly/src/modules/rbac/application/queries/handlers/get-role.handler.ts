/**
 * GetRoleHandler retrieves a single role by ID
 */
import { Inject, Injectable } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetRoleQuery } from '../get-role.query';
import { RoleResponseDto } from '../../dto/response/role-response.dto';
import type { IRoleRepository } from '../../../domain/repositories/role.repository.interface';
import { ROLE_REPOSITORY } from '../../../domain/repositories/role.repository.interface';
import { RoleId } from '../../../domain/value-objects/role-id.vo';

@Injectable()
@QueryHandler(GetRoleQuery)
export class GetRoleHandler
  implements IQueryHandler<GetRoleQuery, RoleResponseDto>
{
  constructor(
    @Inject(ROLE_REPOSITORY)
    private readonly roleRepository: IRoleRepository,
  ) {}

  async execute(query: GetRoleQuery): Promise<RoleResponseDto> {
    const roleId = RoleId.create(query.roleId);
    const role = await this.roleRepository.findById(roleId);
    if (!role) {
      throw new Error('Role not found');
    }
    return RoleResponseDto.fromDomain(role);
  }
}

