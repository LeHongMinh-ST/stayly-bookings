/**
 * IRoleRepository manages role catalog for RBAC assignments
 */
import { Role } from '../value-objects/role.vo';

export interface IRoleRepository {
  findAll(): Promise<Role[]>;
  exists(role: Role): Promise<boolean>;
}

export const ROLE_REPOSITORY = 'ROLE_REPOSITORY';
