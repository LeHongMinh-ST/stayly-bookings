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
import { RoleOrmEntity } from '../entities/role.orm-entity';
import { PermissionOrmEntity } from '../entities/permission.orm-entity';
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
   */
  async save(user: User): Promise<void> {
    const roleCodes = user.getRoles().map((role) => role.getValue());
    const permissionCodes = user
      .getPermissions()
      .map((permission) => permission.getValue());

    const roles = roleCodes.length
      ? await this.roleRepo.find({ where: { code: In(roleCodes) } })
      : [];

    if (roles.length !== roleCodes.length) {
      throw new Error('One or more roles are missing from catalog');
    }

    const permissions = permissionCodes.length
      ? await this.permissionRepo.find({ where: { code: In(permissionCodes) } })
      : [];

    if (permissions.length !== permissionCodes.length) {
      throw new Error('One or more permissions are missing from catalog');
    }

    const existing = await this.userRepo.findOne({
      where: { id: user.getId().getValue() },
      relations: ['roles', 'permissions'],
    });

    const entity = UserOrmMapper.toOrm(user, roles, permissions, existing ?? undefined);
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
      relations: ['roles', 'permissions'],
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
