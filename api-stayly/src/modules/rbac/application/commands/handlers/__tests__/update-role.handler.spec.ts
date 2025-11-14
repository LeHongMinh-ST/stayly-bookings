/**
 * Unit tests for UpdateRoleHandler
 */
import { Test, TestingModule } from '@nestjs/testing';
import { UpdateRoleHandler } from '../update-role.handler';
import { UpdateRoleCommand } from '../../update-role.command';
import { ROLE_REPOSITORY } from '../../../../domain/repositories/role.repository.interface';
import { Role } from '../../../../domain/entities/role.entity';
import { RoleId } from '../../../../domain/value-objects/role-id.vo';
import { randomUUID } from 'crypto';

describe('UpdateRoleHandler', () => {
  let handler: UpdateRoleHandler;
  let findByIdMock: jest.Mock;
  let saveMock: jest.Mock;

  const roleId = RoleId.create(randomUUID());
  const displayName = 'Editor';
  const newDisplayName = 'Content Editor';

  beforeEach(async () => {
    findByIdMock = jest.fn();
    saveMock = jest.fn();

    const mockRoleRepository = {
      findById: findByIdMock,
      save: saveMock,
      findAll: jest.fn(),
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
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should update role display name successfully', async () => {
      // Arrange
      const role = Role.create({
        id: roleId,
        displayName,
      });
      const command = new UpdateRoleCommand(roleId.getValue(), newDisplayName);
      findByIdMock.mockResolvedValue(role);
      saveMock.mockResolvedValue();

      // Act
      const result = await handler.execute(command);

      // Assert
      expect(result).toBeDefined();
      expect(result.displayName).toBe(newDisplayName);
      expect(findByIdMock).toHaveBeenCalledWith(roleId);
      expect(saveMock).toHaveBeenCalled();
    });

    it('should throw error when role not found', async () => {
      // Arrange
      const command = new UpdateRoleCommand(roleId.getValue(), newDisplayName);
      findByIdMock.mockResolvedValue(null);

      // Act & Assert
      await expect(handler.execute(command)).rejects.toThrow('Role not found');
      expect(findByIdMock).toHaveBeenCalledWith(roleId);
      expect(saveMock).not.toHaveBeenCalled();
    });

    it('should not update when displayName is not provided', async () => {
      // Arrange
      const role = Role.create({
        id: roleId,
        displayName,
      });
      const command = new UpdateRoleCommand(roleId.getValue());
      findByIdMock.mockResolvedValue(role);
      saveMock.mockResolvedValue();

      // Act
      const result = await handler.execute(command);

      // Assert
      expect(result).toBeDefined();
      expect(result.displayName).toBe(displayName);
      expect(saveMock).toHaveBeenCalled();
    });
  });
});
