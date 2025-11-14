/**
 * IPermissionRepository exposes permission catalog lookup
 */
import { Permission } from "../value-objects/permission.vo";

export interface IPermissionRepository {
  findAll(
    limit: number,
    offset: number,
    search?: string,
  ): Promise<Permission[]>;
  findByCodes(codes: string[]): Promise<Permission[]>;
  findById(id: string): Promise<Permission | null>;
}

export const PERMISSION_REPOSITORY = "PERMISSION_REPOSITORY";
