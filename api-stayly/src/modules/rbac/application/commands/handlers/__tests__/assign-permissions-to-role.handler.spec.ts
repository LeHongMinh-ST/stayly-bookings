/**
 * Unit tests for AssignPermissionsToRoleHandler
 */
import { Test, TestingModule } from '@nestjs/testing';
import { AssignPermissionsToRoleHandler } from '../assign-permissions-to-role.handler';
import { AssignPermissionsToRoleCommand } from '../../assign-permissions-to-role.command';
import type { IRoleRepository } from '../../../../domain/repositories/role.repository.interface';
import { ROLE_REPOSITORY } from '../../../../domain/repositories/role.repository.interface';
import type { IRolePermissionValidationPort } from '../../../interfaces/role-permission-validation.port';
import { ROLE_PERMISSION_VALIDATION_PORT } from '../../../interfaces/role-permission-validation.port';
import { Role } from '../../../../domain/entities/role.entity';
import { RoleId } from '../../../../domain/value-objects/role-id.vo';
import { Permission } from '../../../../domain/value-objects/permission.vo';
import { randomUUID } from 'crypto';

describe('AssignPermissionsToRoleHandler', () => {
  let handler: AssignPermissionsToRoleHandler;
  let roleRepository: jest.Mocked<IRoleRepository>;
  let rolePermissionValidation: jest.Mocked<IRolePermissionValidationPort>;

  const roleId = RoleId.create(randomUUID());
  const code = 'editor';
  const displayName = 'Editor';

  beforeEach(async () => {
    const mockRoleRepository = {
      findById: jest.fn(),
      save: jest.fn(),
      findAll: jest.fn(),
      findByCode: jest.fn(),
      delete: jest.fn(),
      exists: jest.fn(),
    };

    const mockRolePermissionValidation = {
      validateRoles: jest.fn(),
      validatePermissions: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AssignPermissionsToRoleHandler,
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

    handler = module.get<AssignPermissionsToRoleHandler>(
      AssignPermissionsToRoleHandler,
    );
    roleRepository = module.get(ROLE_REPOSITORY);
    rolePermissionValidation = module.get(ROLE_PERMISSION_VALIDATION_PORT);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should assign permissions to role successfully', async () => {
      // Arrange
      const role = Role.create({
        id: roleId,
        code,
        displayName,
      });
      const permissions = ['user:read', 'user:create'];
      const command = new AssignPermissionsToRoleCommand(
        roleId.getValue(),
        permissions,
      );
      roleRepository.findById.mockResolvedValue(role);
      rolePermissionValidation.validatePermissions.mockResolvedValue(
        permissions,
      );
      roleRepository.save.mockResolvedValue();

      // Act
      const result = await handler.execute(command);

      // Assert
      expect(result).toBeDefined();
      expect(result.permissions).toEqual(permissions);
      expect(rolePermissionValidation.validatePermissions).toHaveBeenCalledWith(
        permissions,
      );
      expect(roleRepository.save).toHaveBeenCalled();
    });

    it('should throw error when role not found', async () => {
      // Arrange
      const permissions = ['user:read'];
      const command = new AssignPermissionsToRoleCommand(
        roleId.getValue(),
        permissions,
      );
      roleRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(handler.execute(command)).rejects.toThrow('Role not found');
      expect(roleRepository.findById).toHaveBeenCalledWith(roleId);
      expect(
        rolePermissionValidation.validatePermissions,
      ).not.toHaveBeenCalled();
      expect(roleRepository.save).not.toHaveBeenCalled();
    });

    it('should validate permissions before assigning', async () => {
      // Arrange
      const role = Role.create({
        id: roleId,
        code,
        displayName,
      });
      const invalidPermissions = ['user:read', 'invalid:permission'];
      const command = new AssignPermissionsToRoleCommand(
        roleId.getValue(),
        invalidPermissions,
      );
      roleRepository.findById.mockResolvedValue(role);
      rolePermissionValidation.validatePermissions.mockRejectedValue(
        new Error('Unknown permission(s): invalid:permission'),
      );

      // Act & Assert
      await expect(handler.execute(command)).rejects.toThrow(
        'Unknown permission(s): invalid:permission',
      );
      expect(rolePermissionValidation.validatePermissions).toHaveBeenCalledWith(
        invalidPermissions,
      );
      expect(roleRepository.save).not.toHaveBeenCalled();
    });

    it('should replace existing permissions', async () => {
      // Arrange
      const existingPermissions = [Permission.create('user:read')];
      const role = Role.create({
        id: roleId,
        code,
        displayName,
        permissions: existingPermissions,
      });
      const newPermissions = ['user:create', 'user:update'];
      const command = new AssignPermissionsToRoleCommand(
        roleId.getValue(),
        newPermissions,
      );
      roleRepository.findById.mockResolvedValue(role);
      rolePermissionValidation.validatePermissions.mockResolvedValue(
        newPermissions,
      );
      roleRepository.save.mockResolvedValue();

      // Act
      const result = await handler.execute(command);

      // Assert
      expect(result.permissions).toEqual(newPermissions);
      expect(result.permissions).not.toContain('user:read');
    });

    it('should handle empty permissions array', async () => {
      // Arrange
      const role = Role.create({
        id: roleId,
        code,
        displayName,
        permissions: [Permission.create('user:read')],
      });
      const command = new AssignPermissionsToRoleCommand(roleId.getValue(), []);
      roleRepository.findById.mockResolvedValue(role);
      rolePermissionValidation.validatePermissions.mockResolvedValue([]);
      roleRepository.save.mockResolvedValue();

      // Act
      const result = await handler.execute(command);

      // Assert
      expect(result.permissions).toEqual([]);
    });
  });
});
