/**
 * IRoleRepository manages role catalog for RBAC assignments
 */
import { Role } from "../entities/role.entity";
import { RoleId } from "../value-objects/role-id.vo";

export interface IRoleRepository {
  findAll(limit?: number, offset?: number): Promise<Role[]>;
  count(): Promise<number>;
  findById(id: RoleId): Promise<Role | null>;
  save(role: Role): Promise<void>;
  delete(role: Role): Promise<void>;
  exists(role: Role): Promise<boolean>;
}

export const ROLE_REPOSITORY = "ROLE_REPOSITORY";
