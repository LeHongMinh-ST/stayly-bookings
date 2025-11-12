/**
 * IPermissionRepository exposes permission catalog lookup
 */
import { Permission } from '../value-objects/permission.vo';

export interface IPermissionRepository {
  findAll(): Promise<Permission[]>;
  findByCodes(codes: string[]): Promise<Permission[]>;
}

export const PERMISSION_REPOSITORY = 'PERMISSION_REPOSITORY';
