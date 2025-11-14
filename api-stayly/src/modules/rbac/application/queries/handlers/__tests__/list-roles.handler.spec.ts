/**
 * Unit tests for ListRolesHandler
 */
import { Test, TestingModule } from '@nestjs/testing';
import { ListRolesHandler } from '../list-roles.handler';
import type { IRoleRepository } from '../../../../domain/repositories/role.repository.interface';
import { ROLE_REPOSITORY } from '../../../../domain/repositories/role.repository.interface';
import { Role } from '../../../../domain/entities/role.entity';
import { RoleId } from '../../../../domain/value-objects/role-id.vo';
import { Permission } from '../../../../domain/value-objects/permission.vo';
import { randomUUID } from 'crypto';

describe('ListRolesHandler', () => {
  let handler: ListRolesHandler;
  let roleRepository: jest.Mocked<IRoleRepository>;

  beforeEach(async () => {
    const mockRoleRepository = {
      findAll: jest.fn(),
      findById: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
      exists: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ListRolesHandler,
        {
          provide: ROLE_REPOSITORY,
          useValue: mockRoleRepository,
        },
      ],
    }).compile();

    handler = module.get<ListRolesHandler>(ListRolesHandler);
    roleRepository = module.get(ROLE_REPOSITORY);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should return list of roles', async () => {
      // Arrange
      const role1 = Role.create({
        id: RoleId.create(randomUUID()),
        displayName: 'Editor',
        permissions: [Permission.create('user:read')],
      });
      const role2 = Role.create({
        id: RoleId.create(randomUUID()),
        displayName: 'Manager',
        permissions: [
          Permission.create('user:read'),
          Permission.create('user:create'),
        ],
      });
      const roles = [role1, role2];
      roleRepository.findAll.mockResolvedValue(roles);

      // Act
      const result = await handler.execute();

      // Assert
      expect(result).toBeDefined();
      expect(result).toHaveLength(2);
      expect(result[0].displayName).toBe('Editor');
      expect(result[1].displayName).toBe('Manager');
      expect(roleRepository.findAll.mock.calls.length).toBeGreaterThan(0);
    });

    it('should return empty array when no roles exist', async () => {
      // Arrange
      roleRepository.findAll.mockResolvedValue([]);

      // Act
      const result = await handler.execute();

      // Assert
      expect(result).toEqual([]);
      expect(roleRepository.findAll.mock.calls.length).toBeGreaterThan(0);
    });

    it('should map roles to DTOs correctly', async () => {
      // Arrange
      const role = Role.create({
        id: RoleId.create(randomUUID()),
        displayName: 'Editor',
        isSuperAdmin: false,
        permissions: [
          Permission.create('user:read'),
          Permission.create('user:create'),
        ],
      });
      roleRepository.findAll.mockResolvedValue([role]);

      // Act
      const result = await handler.execute();

      // Assert
      expect(result[0]).toMatchObject({
        id: role.getId().getValue(),
        displayName: 'Editor',
        isSuperAdmin: false,
        permissions: ['user:read', 'user:create'],
      });
    });
  });
});
