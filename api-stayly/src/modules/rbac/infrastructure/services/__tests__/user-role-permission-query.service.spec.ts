/**
 * Unit tests for UserRolePermissionQueryService
 */
import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { UserRolePermissionQueryService } from "../user-role-permission-query.service";
import { UserOrmEntity } from "../../../../user/infrastructure/persistence/entities/user.orm-entity";
import { RoleOrmEntity } from "../../persistence/entities/role.orm-entity";
import { PermissionOrmEntity } from "../../persistence/entities/permission.orm-entity";
import { randomUUID } from "crypto";

describe("UserRolePermissionQueryService", () => {
  let service: UserRolePermissionQueryService;
  let findOneMock: jest.Mock;
  let findMock: jest.Mock;

  const userId = randomUUID();
  const roleId1 = randomUUID();
  const roleId2 = randomUUID();

  beforeEach(async () => {
    findOneMock = jest.fn();
    findMock = jest.fn();

    const mockUserRepository = {
      findOne: findOneMock,
    };

    const mockRoleRepository = {
      find: findMock,
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserRolePermissionQueryService,
        {
          provide: getRepositoryToken(UserOrmEntity),
          useValue: mockUserRepository,
        },
        {
          provide: getRepositoryToken(RoleOrmEntity),
          useValue: mockRoleRepository,
        },
      ],
    }).compile();

    service = module.get<UserRolePermissionQueryService>(
      UserRolePermissionQueryService,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getUserRolesAndPermissions", () => {
    it("should return roles and permissions for user with roles", async () => {
      // Arrange
      const userPermission: PermissionOrmEntity = {
        id: randomUUID(),
        code: "user:read",
        description: "Read user",
        createdAt: new Date(),
        updatedAt: new Date(),
        users: [],
        roles: [],
      };

      const ownerRolePermission1: PermissionOrmEntity = {
        id: randomUUID(),
        code: "user:read",
        description: "Read user",
        createdAt: new Date(),
        updatedAt: new Date(),
        users: [],
        roles: [],
      };

      const ownerRolePermission2: PermissionOrmEntity = {
        id: randomUUID(),
        code: "user:create",
        description: "Create user",
        createdAt: new Date(),
        updatedAt: new Date(),
        users: [],
        roles: [],
      };

      const managerRolePermission1: PermissionOrmEntity = {
        id: randomUUID(),
        code: "user:read",
        description: "Read user",
        createdAt: new Date(),
        updatedAt: new Date(),
        users: [],
        roles: [],
      };

      const managerRolePermission2: PermissionOrmEntity = {
        id: randomUUID(),
        code: "user:update",
        description: "Update user",
        createdAt: new Date(),
        updatedAt: new Date(),
        users: [],
        roles: [],
      };

      const managerRolePermission3: PermissionOrmEntity = {
        id: randomUUID(),
        code: "booking:read",
        description: "Read booking",
        createdAt: new Date(),
        updatedAt: new Date(),
        users: [],
        roles: [],
      };

      const ownerRole: RoleOrmEntity = {
        id: roleId1,
        displayName: "Owner",
        isSuperAdmin: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        users: [],
        permissions: [ownerRolePermission1, ownerRolePermission2],
      };

      const managerRole: RoleOrmEntity = {
        id: roleId2,
        displayName: "Manager",
        isSuperAdmin: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        users: [],
        permissions: [
          managerRolePermission1,
          managerRolePermission2,
          managerRolePermission3,
        ],
      };

      const user: UserOrmEntity = {
        id: userId,
        email: "user@example.com",
        fullName: "Test User",
        passwordHash: "$2b$10$hashedpassword",
        status: "active",
        createdAt: new Date(),
        updatedAt: new Date(),
        roles: [ownerRole, managerRole],
        permissions: [userPermission],
      };

      findOneMock.mockResolvedValue(user);
      findMock.mockResolvedValue([ownerRole, managerRole]);

      // Act
      const result = await service.getUserRolesAndPermissions(userId);

      // Assert
      expect(result).toBeDefined();
      expect(result.roles).toEqual([roleId1, roleId2]);
      expect(result.isSuperAdmin).toBe(false);
      expect(result.permissions).toContain("user:read"); // Direct permission
      expect(result.permissions).toContain("user:create"); // From owner role
      expect(result.permissions).toContain("user:update"); // From manager role
      expect(result.permissions).toContain("booking:read"); // From manager role
      // Should not have duplicates
      expect(result.permissions.filter((p) => p === "user:read")).toHaveLength(
        1,
      );
    });

    it("should return only direct permissions when user has no roles", async () => {
      // Arrange
      const userPermission1: PermissionOrmEntity = {
        id: randomUUID(),
        code: "user:read",
        description: "Read user",
        createdAt: new Date(),
        updatedAt: new Date(),
        users: [],
        roles: [],
      };

      const userPermission2: PermissionOrmEntity = {
        id: randomUUID(),
        code: "user:create",
        description: "Create user",
        createdAt: new Date(),
        updatedAt: new Date(),
        users: [],
        roles: [],
      };

      const user: UserOrmEntity = {
        id: userId,
        email: "user@example.com",
        fullName: "Test User",
        passwordHash: "$2b$10$hashedpassword",
        status: "active",
        createdAt: new Date(),
        updatedAt: new Date(),
        roles: [],
        permissions: [userPermission1, userPermission2],
      };

      findOneMock.mockResolvedValue(user);
      findMock.mockResolvedValue([]);

      // Act
      const result = await service.getUserRolesAndPermissions(userId);

      // Assert
      expect(result.roles).toEqual([]);
      expect(result.permissions).toEqual(["user:read", "user:create"]);
      expect(result.isSuperAdmin).toBe(false);
      expect(findMock).not.toHaveBeenCalled();
    });

    it("should merge permissions from multiple roles without duplicates", async () => {
      // Arrange
      const ownerRolePermission1: PermissionOrmEntity = {
        id: randomUUID(),
        code: "user:read",
        description: "Read user",
        createdAt: new Date(),
        updatedAt: new Date(),
        users: [],
        roles: [],
      };

      const ownerRolePermission2: PermissionOrmEntity = {
        id: randomUUID(),
        code: "user:create",
        description: "Create user",
        createdAt: new Date(),
        updatedAt: new Date(),
        users: [],
        roles: [],
      };

      const managerRolePermission1: PermissionOrmEntity = {
        id: randomUUID(),
        code: "user:read",
        description: "Read user",
        createdAt: new Date(),
        updatedAt: new Date(),
        users: [],
        roles: [],
      };

      const managerRolePermission2: PermissionOrmEntity = {
        id: randomUUID(),
        code: "user:update",
        description: "Update user",
        createdAt: new Date(),
        updatedAt: new Date(),
        users: [],
        roles: [],
      };

      const ownerRole: RoleOrmEntity = {
        id: roleId1,
        displayName: "Owner",
        isSuperAdmin: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        users: [],
        permissions: [ownerRolePermission1, ownerRolePermission2],
      };

      const managerRole: RoleOrmEntity = {
        id: roleId2,
        displayName: "Manager",
        isSuperAdmin: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        users: [],
        permissions: [managerRolePermission1, managerRolePermission2],
      };

      const user: UserOrmEntity = {
        id: userId,
        email: "user@example.com",
        fullName: "Test User",
        passwordHash: "$2b$10$hashedpassword",
        status: "active",
        createdAt: new Date(),
        updatedAt: new Date(),
        roles: [ownerRole, managerRole],
        permissions: [],
      };

      findOneMock.mockResolvedValue(user);
      findMock.mockResolvedValue([ownerRole, managerRole]);

      // Act
      const result = await service.getUserRolesAndPermissions(userId);

      // Assert
      expect(result.permissions).toContain("user:read");
      expect(result.permissions).toContain("user:create");
      expect(result.permissions).toContain("user:update");
      expect(result.isSuperAdmin).toBe(false);
      // Should not have duplicate user:read
      expect(result.permissions.filter((p) => p === "user:read")).toHaveLength(
        1,
      );
    });

    it("should throw error when user not found", async () => {
      // Arrange
      findOneMock.mockResolvedValue(null);

      // Act & Assert
      await expect(service.getUserRolesAndPermissions(userId)).rejects.toThrow(
        "User not found",
      );
      expect(findOneMock).toHaveBeenCalledWith({
        where: { id: userId },
        relations: ["roles", "permissions"],
      });
      expect(findMock).not.toHaveBeenCalled();
    });

    it("should handle user with super_admin role", async () => {
      // Arrange
      const superAdminPermission1: PermissionOrmEntity = {
        id: randomUUID(),
        code: "user:manage",
        description: "Manage user",
        createdAt: new Date(),
        updatedAt: new Date(),
        users: [],
        roles: [],
      };

      const superAdminPermission2: PermissionOrmEntity = {
        id: randomUUID(),
        code: "booking:manage",
        description: "Manage booking",
        createdAt: new Date(),
        updatedAt: new Date(),
        users: [],
        roles: [],
      };

      const superAdminRole: RoleOrmEntity = {
        id: roleId1,
        displayName: "Super Admin",
        isSuperAdmin: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        users: [],
        permissions: [superAdminPermission1, superAdminPermission2],
      };

      const user: UserOrmEntity = {
        id: userId,
        email: "user@example.com",
        fullName: "Test User",
        passwordHash: "$2b$10$hashedpassword",
        status: "active",
        createdAt: new Date(),
        updatedAt: new Date(),
        roles: [superAdminRole],
        permissions: [],
      };

      findOneMock.mockResolvedValue(user);
      findMock.mockResolvedValue([superAdminRole]);

      // Act
      const result = await service.getUserRolesAndPermissions(userId);

      // Assert
      expect(result.roles).toEqual([roleId1]);
      expect(result.permissions).toContain("user:manage");
      expect(result.permissions).toContain("booking:manage");
      expect(result.isSuperAdmin).toBe(true);
    });
  });
});
