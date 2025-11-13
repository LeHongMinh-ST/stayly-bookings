/**
 * UserRepository provides TypeORM implementation of IUserRepository
 */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { IUserRepository } from '../../../domain/repositories/user.repository.interface';
import { User } from '../../../domain/entities/user.entity';
import { UserId } from '../../../domain/value-objects/user-id.vo';
import { Email } from '../../../../../common/domain/value-objects/email.vo';
import { UserOrmEntity } from '../entities/user.orm-entity';
import { RoleOrmEntity } from '../../../../rbac/infrastructure/persistence/entities/role.orm-entity';
import { PermissionOrmEntity } from '../../../../rbac/infrastructure/persistence/entities/permission.orm-entity';
import { UserOrmMapper } from '../mappers/user.mapper';

@Injectable()
export class UserRepository implements IUserRepository {
  constructor(
    @InjectRepository(UserOrmEntity)
    private readonly userRepo: Repository<UserOrmEntity>,
    @InjectRepository(RoleOrmEntity)
    private readonly roleRepo: Repository<RoleOrmEntity>,
    @InjectRepository(PermissionOrmEntity)
    private readonly permissionRepo: Repository<PermissionOrmEntity>,
  ) {}

  /**
   * Persists aggregate state using upsert semantics
   * Note: Role/permission validation is handled at application layer via RBAC validation port
   */
  async save(user: User): Promise<void> {
    const roleCodes = user.getRoles().map((role) => role.getValueAsString());
    const permissionCodes = user
      .getPermissions()
      .map((permission) => permission.getValue());

    // Load role and permission entities from database
    // These should already be validated at application layer
    const roles = roleCodes.length
      ? await this.roleRepo.find({ where: { code: In(roleCodes) } })
      : [];

    const permissions = permissionCodes.length
      ? await this.permissionRepo.find({ where: { code: In(permissionCodes) } })
      : [];

    const existing = await this.userRepo.findOne({
      where: { id: user.getId().getValue() },
      relations: ['roles', 'permissions'],
    });

    const entity = UserOrmMapper.toOrm(
      user,
      roles,
      permissions,
      existing ?? undefined,
    );
    await this.userRepo.save(entity);
  }

  async findById(id: UserId): Promise<User | null> {
    const entity = await this.userRepo.findOne({
      where: { id: id.getValue() },
      relations: ['roles', 'permissions'],
    });
    return entity ? UserOrmMapper.toDomain(entity) : null;
  }

  async findByEmail(email: Email): Promise<User | null> {
    const entity = await this.userRepo.findOne({
      where: { email: email.getValue() },
      relations: ['roles', 'roles.permissions', 'permissions'],
    });
    return entity ? UserOrmMapper.toDomain(entity) : null;
  }

  async findMany(limit: number, offset: number): Promise<User[]> {
    const entities = await this.userRepo.find({
      take: limit,
      skip: offset,
      order: { createdAt: 'DESC' },
      relations: ['roles', 'permissions'],
    });
    return entities.map((entity) => UserOrmMapper.toDomain(entity));
  }

  async count(): Promise<number> {
    return this.userRepo.count();
  }
}
