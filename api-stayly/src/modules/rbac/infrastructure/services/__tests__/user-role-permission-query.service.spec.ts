/**
 * Unit tests for UserRolePermissionQueryService
 */
import { Test, TestingModule } from '@nestjs/testing';
import { UserRolePermissionQueryService } from '../user-role-permission-query.service';
import type { IUserRepository } from '../../../../user/domain/repositories/user.repository.interface';
import { USER_REPOSITORY } from '../../../../user/domain/repositories/user.repository.interface';
import type { IRoleRepository } from '../../../domain/repositories/role.repository.interface';
import { ROLE_REPOSITORY } from '../../../domain/repositories/role.repository.interface';
import { User } from '../../../../user/domain/entities/user.entity';
import { UserId } from '../../../../user/domain/value-objects/user-id.vo';
import { UserRole } from '../../../../user/domain/value-objects/user-role.vo';
import { UserPermission } from '../../../../user/domain/value-objects/user-permission.vo';
import { Email } from '../../../../../common/domain/value-objects/email.vo';
import { PasswordHash } from '../../../../../common/domain/value-objects/password-hash.vo';
import { Role } from '../../../domain/entities/role.entity';
import { RoleId } from '../../../domain/value-objects/role-id.vo';
import { Permission } from '../../../domain/value-objects/permission.vo';
import { randomUUID } from 'crypto';

describe('UserRolePermissionQueryService', () => {
  let service: UserRolePermissionQueryService;
  let userRepository: jest.Mocked<IUserRepository>;
  let roleRepository: jest.Mocked<IRoleRepository>;

  const userId = randomUUID();
  const roleId1 = RoleId.create(randomUUID());
  const roleId2 = RoleId.create(randomUUID());

  beforeEach(async () => {
    const mockUserRepository = {
      findById: jest.fn(),
      findByEmail: jest.fn(),
      save: jest.fn(),
      findMany: jest.fn(),
    };

    const mockRoleRepository = {
      findAll: jest.fn(),
      findById: jest.fn(),
      findByCode: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
      exists: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserRolePermissionQueryService,
        {
          provide: USER_REPOSITORY,
          useValue: mockUserRepository,
        },
        {
          provide: ROLE_REPOSITORY,
          useValue: mockRoleRepository,
        },
      ],
    }).compile();

    service = module.get<UserRolePermissionQueryService>(
      UserRolePermissionQueryService,
    );
    userRepository = module.get(USER_REPOSITORY);
    roleRepository = module.get(ROLE_REPOSITORY);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getUserRolesAndPermissions', () => {
    it('should return roles and permissions for user with roles', async () => {
      // Arrange
      const user = User.create({
        id: UserId.create(userId),
        email: Email.create('user@example.com'),
        fullName: 'Test User',
        passwordHash: PasswordHash.create('$2b$10$hashedpassword'),
        roles: [
          UserRole.from('owner'),
          UserRole.from('manager'),
        ],
        permissions: [UserPermission.create('user:read')],
      });

      const ownerRole = Role.create({
        id: roleId1,
        code: 'owner',
        displayName: 'Owner',
        permissions: [
          Permission.create('user:read'),
          Permission.create('user:create'),
        ],
      });

      const managerRole = Role.create({
        id: roleId2,
        code: 'manager',
        displayName: 'Manager',
        permissions: [
          Permission.create('user:read'),
          Permission.create('user:update'),
          Permission.create('booking:read'),
        ],
      });

      userRepository.findById.mockResolvedValue(user);
      roleRepository.findAll.mockResolvedValue([ownerRole, managerRole]);

      // Act
      const result = await service.getUserRolesAndPermissions(userId);

      // Assert
      expect(result).toBeDefined();
      expect(result.roles).toEqual(['owner', 'manager']);
      expect(result.permissions).toContain('user:read'); // Direct permission
      expect(result.permissions).toContain('user:create'); // From owner role
      expect(result.permissions).toContain('user:update'); // From manager role
      expect(result.permissions).toContain('booking:read'); // From manager role
      // Should not have duplicates
      expect(result.permissions.filter((p) => p === 'user:read')).toHaveLength(
        1,
      );
    });

    it('should return only direct permissions when user has no roles', async () => {
      // Arrange
      const user = User.create({
        id: UserId.create(userId),
        email: Email.create('user@example.com'),
        fullName: 'Test User',
        passwordHash: PasswordHash.create('$2b$10$hashedpassword'),
        roles: [],
        permissions: [
          UserPermission.create('user:read'),
          UserPermission.create('user:create'),
        ],
      });

      userRepository.findById.mockResolvedValue(user);
      roleRepository.findAll.mockResolvedValue([]);

      // Act
      const result = await service.getUserRolesAndPermissions(userId);

      // Assert
      expect(result.roles).toEqual([]);
      expect(result.permissions).toEqual(['user:read', 'user:create']);
      expect(roleRepository.findAll).not.toHaveBeenCalled();
    });

    it('should merge permissions from multiple roles without duplicates', async () => {
      // Arrange
      const user = User.create({
        id: UserId.create(userId),
        email: Email.create('user@example.com'),
        fullName: 'Test User',
        passwordHash: PasswordHash.create('$2b$10$hashedpassword'),
        roles: [
          UserRole.from('owner'),
          UserRole.from('manager'),
        ],
        permissions: [],
      });

      const ownerRole = Role.create({
        id: roleId1,
        code: 'owner',
        displayName: 'Owner',
        permissions: [
          Permission.create('user:read'),
          Permission.create('user:create'),
        ],
      });

      const managerRole = Role.create({
        id: roleId2,
        code: 'manager',
        displayName: 'Manager',
        permissions: [
          Permission.create('user:read'), // Duplicate
          Permission.create('user:update'),
        ],
      });

      userRepository.findById.mockResolvedValue(user);
      roleRepository.findAll.mockResolvedValue([ownerRole, managerRole]);

      // Act
      const result = await service.getUserRolesAndPermissions(userId);

      // Assert
      expect(result.permissions).toContain('user:read');
      expect(result.permissions).toContain('user:create');
      expect(result.permissions).toContain('user:update');
      // Should not have duplicate user:read
      expect(result.permissions.filter((p) => p === 'user:read')).toHaveLength(
        1,
      );
    });

    it('should throw error when user not found', async () => {
      // Arrange
      userRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.getUserRolesAndPermissions(userId),
      ).rejects.toThrow('User not found');
      expect(userRepository.findById).toHaveBeenCalled();
      expect(roleRepository.findAll).not.toHaveBeenCalled();
    });

    it('should handle user with super_admin role', async () => {
      // Arrange
      const user = User.create({
        id: UserId.create(userId),
        email: Email.create('user@example.com'),
        fullName: 'Test User',
        passwordHash: PasswordHash.create('$2b$10$hashedpassword'),
        roles: [UserRole.from('super_admin')],
        permissions: [],
      });

      const superAdminRole = Role.create({
        id: roleId1,
        code: 'super_admin',
        displayName: 'Super Admin',
        isSuperAdmin: true,
        permissions: [
          Permission.create('user:manage'),
          Permission.create('booking:manage'),
        ],
      });

      userRepository.findById.mockResolvedValue(user);
      roleRepository.findAll.mockResolvedValue([superAdminRole]);

      // Act
      const result = await service.getUserRolesAndPermissions(userId);

      // Assert
      expect(result.roles).toEqual(['super_admin']);
      expect(result.permissions).toContain('user:manage');
      expect(result.permissions).toContain('booking:manage');
    });
  });
});

