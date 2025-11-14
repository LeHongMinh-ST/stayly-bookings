/**
 * UserPermissionLinkService manages direct user-permission relations.
 */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import type { IUserPermissionLinkPort } from '../../application/interfaces/user-permission-link.port';
import { UserOrmEntity } from '../../../user/infrastructure/persistence/entities/user.orm-entity';
import { PermissionOrmEntity } from '../persistence/entities/permission.orm-entity';
import {
  ensureEntityExists,
  throwConflict,
} from '../../../../common/application/exceptions';

@Injectable()
export class UserPermissionLinkService implements IUserPermissionLinkPort {
  constructor(
    @InjectRepository(UserOrmEntity)
    private readonly userRepository: Repository<UserOrmEntity>,
    @InjectRepository(PermissionOrmEntity)
    private readonly permissionRepository: Repository<PermissionOrmEntity>,
  ) {}

  /**
   * Replaces user-permission relation rows with the validated permission set.
   */
  async replaceUserPermissions(
    userId: string,
    permissionCodes: string[],
  ): Promise<void> {
    const user = ensureEntityExists(
      await this.userRepository.findOne({
        where: { id: userId },
        relations: ['permissions'],
      }),
      'User',
      userId,
    );

    if (permissionCodes.length === 0) {
      user.permissions = [];
      await this.userRepository.save(user);
      return;
    }

    const normalizedCodes = permissionCodes.map((code) => code.toLowerCase());
    const permissions = await this.permissionRepository.find({
      where: { code: In(normalizedCodes) },
    });

    if (permissions.length !== normalizedCodes.length) {
      throwConflict('One or more permissions are missing from catalog');
    }

    user.permissions = permissions;
    await this.userRepository.save(user);
  }

  /**
   * Adds a single permission to user (if not already assigned)
   */
  async addPermissionToUser(
    userId: string,
    permissionCode: string,
  ): Promise<void> {
    const user = ensureEntityExists(
      await this.userRepository.findOne({
        where: { id: userId },
        relations: ['permissions'],
      }),
      'User',
      userId,
    );

    const normalizedCode = permissionCode.toLowerCase();
    const permission = ensureEntityExists(
      await this.permissionRepository.findOne({
        where: { code: normalizedCode },
      }),
      'Permission',
      normalizedCode,
    );

    // Check if permission already assigned
    const existingPermission = user.permissions.find(
      (p) => p.code === normalizedCode,
    );
    if (existingPermission) {
      return; // Already assigned, no-op
    }

    user.permissions.push(permission);
    await this.userRepository.save(user);
  }

  /**
   * Removes a single permission from user
   */
  async removePermissionFromUser(
    userId: string,
    permissionCode: string,
  ): Promise<void> {
    const user = ensureEntityExists(
      await this.userRepository.findOne({
        where: { id: userId },
        relations: ['permissions'],
      }),
      'User',
      userId,
    );

    const normalizedCode = permissionCode.toLowerCase();
    user.permissions = user.permissions.filter(
      (p) => p.code !== normalizedCode,
    );
    await this.userRepository.save(user);
  }
}


