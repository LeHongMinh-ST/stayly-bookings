/**
 * UserRoleLinkService applies role assignments using TypeORM repositories.
 */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import type { IUserRoleLinkPort } from '../../application/interfaces/user-role-link.port';
import { UserOrmEntity } from '../../../user/infrastructure/persistence/entities/user.orm-entity';
import { RoleOrmEntity } from '../persistence/entities/role.orm-entity';

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
  async replaceUserRoles(userId: string, roleCodes: string[]): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['roles'],
    });
    if (!user) {
      throw new Error('User not found');
    }

    if (roleCodes.length === 0) {
      user.roles = [];
      await this.userRepository.save(user);
      return;
    }

    const normalizedCodes = roleCodes.map((code) => code.toLowerCase());
    const roles = await this.roleRepository.find({
      where: { code: In(normalizedCodes) },
    });

    if (roles.length !== normalizedCodes.length) {
      throw new Error('One or more roles are missing from catalog');
    }

    user.roles = roles;
    await this.userRepository.save(user);
  }
}


