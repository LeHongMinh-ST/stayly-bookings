/**
 * UserPermissionLinkService manages direct user-permission relations.
 */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import type { IUserPermissionLinkPort } from '../../application/interfaces/user-permission-link.port';
import { UserOrmEntity } from '../../../user/infrastructure/persistence/entities/user.orm-entity';
import { PermissionOrmEntity } from '../persistence/entities/permission.orm-entity';

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
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['permissions'],
    });
    if (!user) {
      throw new Error('User not found');
    }

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
      throw new Error('One or more permissions are missing from catalog');
    }

    user.permissions = permissions;
    await this.userRepository.save(user);
  }
}


