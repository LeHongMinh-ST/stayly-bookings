/**
 * Unit tests for CreateRoleHandler
 */
import { Test, TestingModule } from '@nestjs/testing';
import { CreateRoleHandler } from '../create-role.handler';
import { CreateRoleCommand } from '../../create-role.command';
import type { IRoleRepository } from '../../../../domain/repositories/role.repository.interface';
import { ROLE_REPOSITORY } from '../../../../domain/repositories/role.repository.interface';
import type { IRolePermissionValidationPort } from '../../../interfaces/role-permission-validation.port';
import { ROLE_PERMISSION_VALIDATION_PORT } from '../../../interfaces/role-permission-validation.port';
import { Role } from '../../../../domain/entities/role.entity';
import { RoleId } from '../../../../domain/value-objects/role-id.vo';
import { Permission } from '../../../../domain/value-objects/permission.vo';
import { randomUUID } from 'crypto';

describe('CreateRoleHandler', () => {
  let handler: CreateRoleHandler;
  let roleRepository: jest.Mocked<IRoleRepository>;
  let rolePermissionValidation: jest.Mocked<IRolePermissionValidationPort>;

  const roleId = RoleId.create(randomUUID());
  const displayName = 'Editor';

  beforeEach(async () => {
    const mockRoleRepository = {
      save: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
      delete: jest.fn(),
      exists: jest.fn(),
    };

    const mockRolePermissionValidation = {
      validateRoles: jest.fn(),
      validatePermissions: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateRoleHandler,
        {
          provide: ROLE_REPOSITORY,
          useValue: mockRoleRepository,
        },
        {
          provide: ROLE_PERMISSION_VALIDATION_PORT,
          useValue: mockRolePermissionValidation,
        },
      ],
    }).compile();

    handler = module.get<CreateRoleHandler>(CreateRoleHandler);
    roleRepository = module.get(ROLE_REPOSITORY);
    rolePermissionValidation = module.get(ROLE_PERMISSION_VALIDATION_PORT);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should create role successfully without permissions', async () => {
      // Arrange
      const command = new CreateRoleCommand(displayName);
      roleRepository.save.mockResolvedValue();

      // Act
      const result = await handler.execute(command);

      // Assert
      expect(result).toBeDefined();
      expect(result.displayName).toBe(displayName);
      expect(result.isSuperAdmin).toBe(false);
      expect(result.permissions).toEqual([]);
      expect(roleRepository.save).toHaveBeenCalled();
      expect(
        rolePermissionValidation.validatePermissions,
      ).not.toHaveBeenCalled();
    });

    it('should create role with permissions', async () => {
      // Arrange
      const permissions = ['user:read', 'user:create'];
      const command = new CreateRoleCommand(displayName, permissions);
      rolePermissionValidation.validatePermissions.mockResolvedValue(
        permissions,
      );
      roleRepository.save.mockResolvedValue();

      // Act
      const result = await handler.execute(command);

      // Assert
      expect(result).toBeDefined();
      expect(result.displayName).toBe(displayName);
      expect(result.permissions).toEqual(permissions);
      expect(rolePermissionValidation.validatePermissions).toHaveBeenCalledWith(
        permissions,
      );
      expect(roleRepository.save).toHaveBeenCalled();
    });

    it('should validate permissions before creating role', async () => {
      // Arrange
      const permissions = ['user:read', 'invalid:permission'];
      const command = new CreateRoleCommand(displayName, permissions);
      rolePermissionValidation.validatePermissions.mockRejectedValue(
        new Error('Unknown permission(s): invalid:permission'),
      );

      // Act & Assert
      await expect(handler.execute(command)).rejects.toThrow(
        'Unknown permission(s): invalid:permission',
      );
      expect(rolePermissionValidation.validatePermissions).toHaveBeenCalledWith(
        permissions,
      );
      expect(roleRepository.save).not.toHaveBeenCalled();
    });
  });
});
