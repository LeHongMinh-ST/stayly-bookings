/**
 * Unit tests for UpdateRoleHandler
 */
import { Test, TestingModule } from '@nestjs/testing';
import { UpdateRoleHandler } from '../update-role.handler';
import { UpdateRoleCommand } from '../../update-role.command';
import type { IRoleRepository } from '../../../../domain/repositories/role.repository.interface';
import { ROLE_REPOSITORY } from '../../../../domain/repositories/role.repository.interface';
import { Role } from '../../../../domain/entities/role.entity';
import { RoleId } from '../../../../domain/value-objects/role-id.vo';
import { randomUUID } from 'crypto';

describe('UpdateRoleHandler', () => {
  let handler: UpdateRoleHandler;
  let roleRepository: jest.Mocked<IRoleRepository>;

  const roleId = RoleId.create(randomUUID());
  const code = 'editor';
  const displayName = 'Editor';
  const newDisplayName = 'Content Editor';

  beforeEach(async () => {
    const mockRoleRepository = {
      findById: jest.fn(),
      save: jest.fn(),
      findAll: jest.fn(),
      findByCode: jest.fn(),
      delete: jest.fn(),
      exists: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateRoleHandler,
        {
          provide: ROLE_REPOSITORY,
          useValue: mockRoleRepository,
        },
      ],
    }).compile();

    handler = module.get<UpdateRoleHandler>(UpdateRoleHandler);
    roleRepository = module.get(ROLE_REPOSITORY);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should update role display name successfully', async () => {
      // Arrange
      const role = Role.create({
        id: roleId,
        code,
        displayName,
      });
      const command = new UpdateRoleCommand(roleId.getValue(), newDisplayName);
      roleRepository.findById.mockResolvedValue(role);
      roleRepository.save.mockResolvedValue();

      // Act
      const result = await handler.execute(command);

      // Assert
      expect(result).toBeDefined();
      expect(result.displayName).toBe(newDisplayName);
      expect(result.code).toBe(code);
      expect(roleRepository.findById).toHaveBeenCalledWith(roleId);
      expect(roleRepository.save).toHaveBeenCalled();
    });

    it('should throw error when role not found', async () => {
      // Arrange
      const command = new UpdateRoleCommand(roleId.getValue(), newDisplayName);
      roleRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(handler.execute(command)).rejects.toThrow('Role not found');
      expect(roleRepository.findById).toHaveBeenCalledWith(roleId);
      expect(roleRepository.save).not.toHaveBeenCalled();
    });

    it('should not update when displayName is not provided', async () => {
      // Arrange
      const role = Role.create({
        id: roleId,
        code,
        displayName,
      });
      const command = new UpdateRoleCommand(roleId.getValue());
      roleRepository.findById.mockResolvedValue(role);
      roleRepository.save.mockResolvedValue();

      // Act
      const result = await handler.execute(command);

      // Assert
      expect(result).toBeDefined();
      expect(result.displayName).toBe(displayName);
      expect(roleRepository.save).toHaveBeenCalled();
    });

  });
});

