/**
 * RoleRepository provides lookup capabilities for role catalog
 */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IRoleRepository } from '../../../domain/repositories/role.repository.interface';
import { Role, UserRole } from '../../../domain/value-objects/role.vo';
import { RoleOrmEntity } from '../entities/role.orm-entity';

@Injectable()
export class RoleRepository implements IRoleRepository {
  constructor(
    @InjectRepository(RoleOrmEntity)
    private readonly roleRepo: Repository<RoleOrmEntity>,
  ) {}

  async findAll(): Promise<Role[]> {
    const roles = await this.roleRepo.find({ order: { code: 'ASC' } });
    return roles.map((role) => Role.from(role.code));
  }

  async exists(role: Role): Promise<boolean> {
    const count = await this.roleRepo.count({ where: { code: role.getValue() } });
    return count > 0;
  }
}
