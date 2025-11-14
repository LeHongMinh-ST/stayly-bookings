/**
 * Unit tests for RolePermissionValidationService
 */
import { Test, TestingModule } from '@nestjs/testing';
import { RolePermissionValidationService } from '../role-permission-validation.service';
import { ROLE_REPOSITORY } from '../../../domain/repositories/role.repository.interface';
import { PERMISSION_REPOSITORY } from '../../../domain/repositories/permission.repository.interface';
import { Role } from '../../../domain/entities/role.entity';
import { RoleId } from '../../../domain/value-objects/role-id.vo';
import { Permission } from '../../../domain/value-objects/permission.vo';
import { randomUUID } from 'crypto';

describe('RolePermissionValidationService', () => {
  let service: RolePermissionValidationService;
  let findByIdMock: jest.Mock;
  let findByCodesMock: jest.Mock;

  beforeEach(async () => {
    findByIdMock = jest.fn();
    findByCodesMock = jest.fn();

    const mockRoleRepository = {
      findAll: jest.fn(),
      findById: findByIdMock,
      findByCode: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
      exists: jest.fn(),
    };

    const mockPermissionRepository = {
      findAll: jest.fn(),
      findByCodes: findByCodesMock,
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolePermissionValidationService,
        {
          provide: ROLE_REPOSITORY,
          useValue: mockRoleRepository,
        },
        {
          provide: PERMISSION_REPOSITORY,
          useValue: mockPermissionRepository,
        },
      ],
    }).compile();

    service = module.get<RolePermissionValidationService>(
      RolePermissionValidationService,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('validateRoles', () => {
    it('should validate roles successfully when roles have permissions', async () => {
      // Arrange
      const roleId1 = randomUUID();
      const roleId2 = randomUUID();
      const roleIds = [roleId1, roleId2];

      const role1 = Role.create({
        id: RoleId.create(roleId1),
        displayName: 'Editor',
        permissions: [Permission.create('user:read')],
      });

      const role2 = Role.create({
        id: RoleId.create(roleId2),
        displayName: 'Manager',
        permissions: [Permission.create('user:write')],
      });

      findByIdMock.mockResolvedValueOnce(role1).mockResolvedValueOnce(role2);

      // Act
      const result = await service.validateRoles(roleIds);

      // Assert
      expect(result).toEqual(roleIds);
      expect(findByIdMock).toHaveBeenCalledTimes(2);
    });

    it('should throw error when at least one role is required', async () => {
      // Act & Assert
      await expect(service.validateRoles([])).rejects.toThrow(
        'At least one role is required',
      );
      expect(findByIdMock).not.toHaveBeenCalled();
    });

    it('should throw error when role does not exist', async () => {
      // Arrange
      const roleId1 = randomUUID();
      const invalidRoleId = randomUUID();
      const roleIds = [roleId1, invalidRoleId];

      const role1 = Role.create({
        id: RoleId.create(roleId1),
        displayName: 'Editor',
        permissions: [Permission.create('user:read')],
      });

      findByIdMock.mockResolvedValueOnce(role1).mockResolvedValueOnce(null);

      // Act & Assert
      await expect(service.validateRoles(roleIds)).rejects.toThrow(
        `Invalid role(s) or role(s) without permissions: ${invalidRoleId}`,
      );
    });

    it('should throw error when role has no permissions', async () => {
      // Arrange
      const roleId1 = randomUUID();
      const roleId2 = randomUUID();
      const roleIds = [roleId1, roleId2];

      const role1 = Role.create({
        id: RoleId.create(roleId1),
        displayName: 'Editor',
        permissions: [Permission.create('user:read')],
      });

      const role2 = Role.create({
        id: RoleId.create(roleId2),
        displayName: 'Manager',
        permissions: [], // No permissions
      });

      findByIdMock.mockResolvedValueOnce(role1).mockResolvedValueOnce(role2);

      // Act & Assert
      await expect(service.validateRoles(roleIds)).rejects.toThrow(
        `Invalid role(s) or role(s) without permissions: ${roleId2}`,
      );
    });

    it('should validate super admin role even without permissions', async () => {
      // Arrange
      const superAdminRoleId = randomUUID();
      const roleId = randomUUID();
      const roleIds = [superAdminRoleId, roleId];

      const superAdminRole = Role.create({
        id: RoleId.create(superAdminRoleId),
        displayName: 'Super Admin',
        isSuperAdmin: true,
        permissions: [], // Super admin can have no permissions
      });

      const role = Role.create({
        id: RoleId.create(roleId),
        displayName: 'Editor',
        permissions: [Permission.create('user:read')],
      });

      findByIdMock
        .mockResolvedValueOnce(superAdminRole)
        .mockResolvedValueOnce(role);

      // Act
      const result = await service.validateRoles(roleIds);

      // Assert
      expect(result).toEqual(roleIds);
      expect(superAdminRole.getIsSuperAdmin()).toBe(true);
    });
  });

  describe('validatePermissions', () => {
    it('should validate permissions successfully', async () => {
      // Arrange
      const permissionCodes = ['user:read', 'user:create'];
      const permissions = [
        Permission.create('user:read'),
        Permission.create('user:create'),
        Permission.create('user:update'),
      ];
      findByCodesMock.mockResolvedValue(permissions);

      // Act
      const result = await service.validatePermissions(permissionCodes);

      // Assert
      expect(result).toEqual(permissionCodes);
      expect(findByCodesMock).toHaveBeenCalledWith(permissionCodes);
    });

    it('should return empty array when permission codes is empty', async () => {
      // Act
      const result = await service.validatePermissions([]);

      // Assert
      expect(result).toEqual([]);
      expect(findByCodesMock).not.toHaveBeenCalled();
    });

    it('should throw error when permission does not exist', async () => {
      // Arrange
      const permissionCodes = ['user:read', 'invalid:permission'];
      const permissions = [Permission.create('user:read')];
      findByCodesMock.mockResolvedValue(permissions);

      // Act & Assert
      await expect(
        service.validatePermissions(permissionCodes),
      ).rejects.toThrow('Unknown permission(s): invalid:permission');
    });

    it('should handle case-insensitive permission codes', async () => {
      // Arrange
      const permissionCodes = ['USER:READ', 'USER:CREATE'];
      const permissions = [
        Permission.create('user:read'),
        Permission.create('user:create'),
      ];
      findByCodesMock.mockResolvedValue(permissions);

      // Act
      const result = await service.validatePermissions(permissionCodes);

      // Assert
      expect(result).toEqual(permissionCodes);
    });
  });
});
