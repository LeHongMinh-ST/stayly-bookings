/**
 * Unit tests for RolePermissionValidationService
 */
import { Test, TestingModule } from '@nestjs/testing';
import { RolePermissionValidationService } from '../role-permission-validation.service';
import type { IRoleRepository } from '../../../domain/repositories/role.repository.interface';
import { ROLE_REPOSITORY } from '../../../domain/repositories/role.repository.interface';
import type { IPermissionRepository } from '../../../domain/repositories/permission.repository.interface';
import { PERMISSION_REPOSITORY } from '../../../domain/repositories/permission.repository.interface';
import { Role } from '../../../domain/entities/role.entity';
import { RoleId } from '../../../domain/value-objects/role-id.vo';
import { Permission } from '../../../domain/value-objects/permission.vo';
import { randomUUID } from 'crypto';

describe('RolePermissionValidationService', () => {
  let service: RolePermissionValidationService;
  let roleRepository: jest.Mocked<IRoleRepository>;
  let permissionRepository: jest.Mocked<IPermissionRepository>;

  beforeEach(async () => {
    const mockRoleRepository = {
      findAll: jest.fn(),
      findById: jest.fn(),
      findByCode: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
      exists: jest.fn(),
    };

    const mockPermissionRepository = {
      findAll: jest.fn(),
      findByCodes: jest.fn(),
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
    roleRepository = module.get(ROLE_REPOSITORY);
    permissionRepository = module.get(PERMISSION_REPOSITORY);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('validateRoles', () => {
    it('should validate roles successfully', async () => {
      // Arrange
      const roleCodes = ['editor', 'manager'];
      const roles = [
        Role.create({
          id: RoleId.create(randomUUID()),
          code: 'editor',
          displayName: 'Editor',
        }),
        Role.create({
          id: RoleId.create(randomUUID()),
          code: 'manager',
          displayName: 'Manager',
        }),
        Role.create({
          id: RoleId.create(randomUUID()),
          code: 'staff',
          displayName: 'Staff',
        }),
      ];
      roleRepository.findAll.mockResolvedValue(roles);

      // Act
      const result = await service.validateRoles(roleCodes);

      // Assert
      expect(result).toEqual(roleCodes);
      expect(roleRepository.findAll).toHaveBeenCalled();
    });

    it('should throw error when at least one role is required', async () => {
      // Act & Assert
      await expect(service.validateRoles([])).rejects.toThrow(
        'At least one role is required',
      );
      expect(roleRepository.findAll).not.toHaveBeenCalled();
    });

    it('should throw error when role does not exist', async () => {
      // Arrange
      const roleCodes = ['editor', 'invalid_role'];
      const roles = [
        Role.create({
          id: RoleId.create(randomUUID()),
          code: 'editor',
          displayName: 'Editor',
        }),
      ];
      roleRepository.findAll.mockResolvedValue(roles);

      // Act & Assert
      await expect(service.validateRoles(roleCodes)).rejects.toThrow(
        'Unknown role(s): invalid_role',
      );
    });

    it('should handle case-insensitive role codes', async () => {
      // Arrange
      const roleCodes = ['EDITOR', 'MANAGER'];
      const roles = [
        Role.create({
          id: RoleId.create(randomUUID()),
          code: 'editor',
          displayName: 'Editor',
        }),
        Role.create({
          id: RoleId.create(randomUUID()),
          code: 'manager',
          displayName: 'Manager',
        }),
      ];
      roleRepository.findAll.mockResolvedValue(roles);

      // Act
      const result = await service.validateRoles(roleCodes);

      // Assert
      expect(result).toEqual(roleCodes);
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
      permissionRepository.findByCodes.mockResolvedValue(permissions);

      // Act
      const result = await service.validatePermissions(permissionCodes);

      // Assert
      expect(result).toEqual(permissionCodes);
      expect(permissionRepository.findByCodes).toHaveBeenCalledWith(
        permissionCodes,
      );
    });

    it('should return empty array when permission codes is empty', async () => {
      // Act
      const result = await service.validatePermissions([]);

      // Assert
      expect(result).toEqual([]);
      expect(permissionRepository.findByCodes).not.toHaveBeenCalled();
    });

    it('should throw error when permission does not exist', async () => {
      // Arrange
      const permissionCodes = ['user:read', 'invalid:permission'];
      const permissions = [Permission.create('user:read')];
      permissionRepository.findByCodes.mockResolvedValue(permissions);

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
      permissionRepository.findByCodes.mockResolvedValue(permissions);

      // Act
      const result = await service.validatePermissions(permissionCodes);

      // Assert
      expect(result).toEqual(permissionCodes);
    });
  });
});

