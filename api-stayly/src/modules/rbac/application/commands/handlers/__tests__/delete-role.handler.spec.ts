/**
 * Unit tests for DeleteRoleHandler
 */
import { Test, TestingModule } from '@nestjs/testing';
import { DeleteRoleHandler } from '../delete-role.handler';
import { DeleteRoleCommand } from '../../delete-role.command';
import type { IRoleRepository } from '../../../../domain/repositories/role.repository.interface';
import { ROLE_REPOSITORY } from '../../../../domain/repositories/role.repository.interface';
import { Role } from '../../../../domain/entities/role.entity';
import { RoleId } from '../../../../domain/value-objects/role-id.vo';
import { randomUUID } from 'crypto';

describe('DeleteRoleHandler', () => {
  let handler: DeleteRoleHandler;
  let roleRepository: jest.Mocked<IRoleRepository>;

  const roleId = RoleId.create(randomUUID());
  const displayName = 'Editor';

  beforeEach(async () => {
    const mockRoleRepository = {
      findById: jest.fn(),
      delete: jest.fn(),
      findAll: jest.fn(),
      save: jest.fn(),
      exists: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteRoleHandler,
        {
          provide: ROLE_REPOSITORY,
          useValue: mockRoleRepository,
        },
      ],
    }).compile();

    handler = module.get<DeleteRoleHandler>(DeleteRoleHandler);
    roleRepository = module.get(ROLE_REPOSITORY);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should delete role successfully', async () => {
      // Arrange
      const role = Role.create({
        id: roleId,
        displayName,
        isSuperAdmin: false,
      });
      const command = new DeleteRoleCommand(roleId.getValue());
      roleRepository.findById.mockResolvedValue(role);
      roleRepository.delete.mockResolvedValue();

      // Act
      await handler.execute(command);

      // Assert
      expect(roleRepository.findById).toHaveBeenCalledWith(roleId);
      expect(roleRepository.delete).toHaveBeenCalledWith(role);
    });

    it('should throw error when role not found', async () => {
      // Arrange
      const command = new DeleteRoleCommand(roleId.getValue());
      roleRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(handler.execute(command)).rejects.toThrow('Role not found');
      expect(roleRepository.findById).toHaveBeenCalledWith(roleId);
      expect(roleRepository.delete).not.toHaveBeenCalled();
    });

    it('should throw error when trying to delete super admin role', async () => {
      // Arrange
      const superAdminRole = Role.create({
        id: roleId,
        displayName: 'Super Admin',
        isSuperAdmin: true,
      });
      const command = new DeleteRoleCommand(roleId.getValue());
      roleRepository.findById.mockResolvedValue(superAdminRole);

      // Act & Assert
      await expect(handler.execute(command)).rejects.toThrow(
        'Cannot delete super admin role',
      );
      expect(roleRepository.findById).toHaveBeenCalledWith(roleId);
      expect(roleRepository.delete).not.toHaveBeenCalled();
    });

    it('should allow deletion of non-super-admin roles', async () => {
      // Arrange
      const regularRole = Role.create({
        id: roleId,
        displayName,
        isSuperAdmin: false,
      });
      const command = new DeleteRoleCommand(roleId.getValue());
      roleRepository.findById.mockResolvedValue(regularRole);
      roleRepository.delete.mockResolvedValue();

      // Act
      await handler.execute(command);

      // Assert
      expect(roleRepository.delete).toHaveBeenCalledWith(regularRole);
    });
  });
});
