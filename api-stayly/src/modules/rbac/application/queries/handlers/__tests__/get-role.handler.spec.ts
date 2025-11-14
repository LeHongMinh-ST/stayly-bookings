/**
 * Unit tests for GetRoleHandler
 */
import { Test, TestingModule } from '@nestjs/testing';
import { GetRoleHandler } from '../get-role.handler';
import { GetRoleQuery } from '../../get-role.query';
import type { IRoleRepository } from '../../../../domain/repositories/role.repository.interface';
import { ROLE_REPOSITORY } from '../../../../domain/repositories/role.repository.interface';
import { Role } from '../../../../domain/entities/role.entity';
import { RoleId } from '../../../../domain/value-objects/role-id.vo';
import { Permission } from '../../../../domain/value-objects/permission.vo';
import { randomUUID } from 'crypto';

describe('GetRoleHandler', () => {
  let handler: GetRoleHandler;
  let roleRepository: jest.Mocked<IRoleRepository>;

  const roleId = RoleId.create(randomUUID());
  const displayName = 'Editor';

  beforeEach(async () => {
      const mockRoleRepository = {
        findById: jest.fn(),
        findAll: jest.fn(),
        save: jest.fn(),
        delete: jest.fn(),
        exists: jest.fn(),
      };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetRoleHandler,
        {
          provide: ROLE_REPOSITORY,
          useValue: mockRoleRepository,
        },
      ],
    }).compile();

    handler = module.get<GetRoleHandler>(GetRoleHandler);
    roleRepository = module.get(ROLE_REPOSITORY);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should return role by ID successfully', async () => {
      // Arrange
      const permissions = [
        Permission.create('user:read'),
        Permission.create('user:create'),
      ];
      const role = Role.create({
        id: roleId,
        displayName,
        permissions,
      });
      const query = new GetRoleQuery(roleId.getValue());
      roleRepository.findById.mockResolvedValue(role);

      // Act
      const result = await handler.execute(query);

      // Assert
      expect(result).toBeDefined();
      expect(result.id).toBe(roleId.getValue());
      expect(result.displayName).toBe(displayName);
      expect(result.permissions).toEqual(['user:read', 'user:create']);
      expect(roleRepository.findById).toHaveBeenCalledWith(roleId);
    });

    it('should throw error when role not found', async () => {
      // Arrange
      const query = new GetRoleQuery(roleId.getValue());
      roleRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(handler.execute(query)).rejects.toThrow('Role not found');
      expect(roleRepository.findById).toHaveBeenCalledWith(roleId);
    });

    it('should return role with empty permissions', async () => {
      // Arrange
      const role = Role.create({
        id: roleId,
        displayName,
      });
      const query = new GetRoleQuery(roleId.getValue());
      roleRepository.findById.mockResolvedValue(role);

      // Act
      const result = await handler.execute(query);

      // Assert
      expect(result.permissions).toEqual([]);
    });

    it('should return role with isSuperAdmin flag', async () => {
      // Arrange
      const role = Role.create({
        id: roleId,
        displayName: 'Super Admin',
        isSuperAdmin: true,
      });
      const query = new GetRoleQuery(roleId.getValue());
      roleRepository.findById.mockResolvedValue(role);

      // Act
      const result = await handler.execute(query);

      // Assert
      expect(result.isSuperAdmin).toBe(true);
    });
  });
});

