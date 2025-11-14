/**
 * UserRoleLinkService applies role assignments using TypeORM repositories.
 */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import type { IUserRoleLinkPort } from '../../application/interfaces/user-role-link.port';
import { UserOrmEntity } from '../../../user/infrastructure/persistence/entities/user.orm-entity';
import { RoleOrmEntity } from '../persistence/entities/role.orm-entity';
import {
  ensureEntityExists,
  throwConflict,
} from '../../../../common/application/exceptions';

@Injectable()
export class UserRoleLinkService implements IUserRoleLinkPort {
  constructor(
    @InjectRepository(UserOrmEntity)
    private readonly userRepository: Repository<UserOrmEntity>,
    @InjectRepository(RoleOrmEntity)
    private readonly roleRepository: Repository<RoleOrmEntity>,
  ) {}

  /**
   * Replaces user-role relation rows by loading current relations and persisting the new set.
   */
  async replaceUserRoles(userId: string, roleIds: string[]): Promise<void> {
    const user = ensureEntityExists(
      await this.userRepository.findOne({
        where: { id: userId },
        relations: ['roles'],
      }),
      'User',
      userId,
    );

    if (roleIds.length === 0) {
      user.roles = [];
      await this.userRepository.save(user);
      return;
    }

    const roles = await this.roleRepository.find({
      where: { id: In(roleIds) },
    });

    if (roles.length !== roleIds.length) {
      throwConflict('One or more roles are missing from catalog');
    }

    user.roles = roles;
    await this.userRepository.save(user);
  }

  /**
   * Adds a single role to user (if not already assigned)
   */
  async addRoleToUser(userId: string, roleId: string): Promise<void> {
    const user = ensureEntityExists(
      await this.userRepository.findOne({
        where: { id: userId },
        relations: ['roles'],
      }),
      'User',
      userId,
    );

    const role = ensureEntityExists(
      await this.roleRepository.findOne({
        where: { id: roleId },
      }),
      'Role',
      roleId,
    );

    // Check if role already assigned
    const existingRole = user.roles.find((r) => r.id === roleId);
    if (existingRole) {
      return; // Already assigned, no-op
    }

    user.roles.push(role);
    await this.userRepository.save(user);
  }

  /**
   * Removes a single role from user
   */
  async removeRoleFromUser(userId: string, roleId: string): Promise<void> {
    const user = ensureEntityExists(
      await this.userRepository.findOne({
        where: { id: userId },
        relations: ['roles'],
      }),
      'User',
      userId,
    );

    user.roles = user.roles.filter((r) => r.id !== roleId);
    await this.userRepository.save(user);
  }
}
