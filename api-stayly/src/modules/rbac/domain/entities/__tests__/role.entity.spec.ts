/**
 * Unit tests for Role domain entity
 */
import { Role } from "../role.entity";
import { RoleId } from "../../value-objects/role-id.vo";
import { Permission } from "../../value-objects/permission.vo";
import { randomUUID } from "crypto";

describe("Role", () => {
  const validRoleId = RoleId.create(randomUUID());
  const validDisplayName = "Editor";

  describe("create", () => {
    it("should create Role with valid props", () => {
      // Arrange
      const props = {
        id: validRoleId,
        displayName: validDisplayName,
      };

      // Act
      const role = Role.create(props);

      // Assert
      expect(role).toBeDefined();
      expect(role.getId()).toBe(validRoleId);
      expect(role.getDisplayName()).toBe(validDisplayName);
      expect(role.getIsSuperAdmin()).toBe(false);
      expect(role.getPermissions()).toEqual([]);
    });

    it("should trim displayName", () => {
      // Arrange
      const props = {
        id: validRoleId,
        displayName: "  Editor  ",
      };

      // Act
      const role = Role.create(props);

      // Assert
      expect(role.getDisplayName()).toBe("Editor");
    });

    it("should create Role with isSuperAdmin flag", () => {
      // Arrange
      const props = {
        id: validRoleId,
        displayName: validDisplayName,
        isSuperAdmin: true,
      };

      // Act
      const role = Role.create(props);

      // Assert
      expect(role.getIsSuperAdmin()).toBe(true);
    });

    it("should create Role with permissions", () => {
      // Arrange
      const permissions = [
        Permission.create("user:read"),
        Permission.create("user:create"),
      ];
      const props = {
        id: validRoleId,
        displayName: validDisplayName,
        permissions,
      };

      // Act
      const role = Role.create(props);

      // Assert
      expect(role.getPermissions()).toHaveLength(2);
      expect(role.getPermissions()[0].getValue()).toBe("user:read");
      expect(role.getPermissions()[1].getValue()).toBe("user:create");
    });

    it("should throw error when displayName is empty", () => {
      // Arrange
      const props = {
        id: validRoleId,
        displayName: "",
      };

      // Act & Assert
      expect(() => Role.create(props)).toThrow("Role display name is required");
    });
  });

  describe("rehydrate", () => {
    it("should rehydrate Role from persisted data", () => {
      // Arrange
      const permissions = [
        Permission.create("user:read"),
        Permission.create("user:create"),
      ];
      const props = {
        id: validRoleId,
        displayName: validDisplayName,
        isSuperAdmin: true,
        permissions,
      };

      // Act
      const role = Role.rehydrate(props);

      // Assert
      expect(role.getId()).toBe(validRoleId);
      expect(role.getDisplayName()).toBe(validDisplayName);
      expect(role.getIsSuperAdmin()).toBe(true);
      expect(role.getPermissions()).toHaveLength(2);
    });
  });

  describe("updateDisplayName", () => {
    it("should update display name", () => {
      // Arrange
      const role = Role.create({
        id: validRoleId,
        displayName: validDisplayName,
      });
      const newDisplayName = "Content Editor";

      // Act
      role.updateDisplayName(newDisplayName);

      // Assert
      expect(role.getDisplayName()).toBe(newDisplayName);
    });

    it("should trim display name", () => {
      // Arrange
      const role = Role.create({
        id: validRoleId,
        displayName: validDisplayName,
      });

      // Act
      role.updateDisplayName("  New Display Name  ");

      // Assert
      expect(role.getDisplayName()).toBe("New Display Name");
    });

    it("should throw error when display name is empty", () => {
      // Arrange
      const role = Role.create({
        id: validRoleId,
        displayName: validDisplayName,
      });

      // Act & Assert
      expect(() => role.updateDisplayName("")).toThrow(
        "Role display name is required",
      );
      expect(() => role.updateDisplayName("   ")).toThrow(
        "Role display name is required",
      );
    });
  });

  describe("assignPermissions", () => {
    it("should assign permissions to role", () => {
      // Arrange
      const role = Role.create({
        id: validRoleId,
        displayName: validDisplayName,
      });
      const permissions = [
        Permission.create("user:read"),
        Permission.create("user:create"),
      ];

      // Act
      role.assignPermissions(permissions);

      // Assert
      expect(role.getPermissions()).toHaveLength(2);
      expect(role.getPermissions()[0].getValue()).toBe("user:read");
      expect(role.getPermissions()[1].getValue()).toBe("user:create");
    });

    it("should remove duplicate permissions", () => {
      // Arrange
      const role = Role.create({
        id: validRoleId,
        displayName: validDisplayName,
      });
      const permissions = [
        Permission.create("user:read"),
        Permission.create("user:read"), // Duplicate
        Permission.create("user:create"),
        Permission.create("user:read"), // Duplicate again
      ];

      // Act
      role.assignPermissions(permissions);

      // Assert
      expect(role.getPermissions()).toHaveLength(2);
      expect(role.getPermissions()[0].getValue()).toBe("user:read");
      expect(role.getPermissions()[1].getValue()).toBe("user:create");
    });

    it("should replace existing permissions", () => {
      // Arrange
      const role = Role.create({
        id: validRoleId,
        displayName: validDisplayName,
        permissions: [Permission.create("user:read")],
      });
      const newPermissions = [
        Permission.create("user:create"),
        Permission.create("user:update"),
      ];

      // Act
      role.assignPermissions(newPermissions);

      // Assert
      expect(role.getPermissions()).toHaveLength(2);
      expect(role.getPermissions()[0].getValue()).toBe("user:create");
      expect(role.getPermissions()[1].getValue()).toBe("user:update");
    });
  });

  describe("removePermissions", () => {
    it("should remove specified permissions", () => {
      // Arrange
      const role = Role.create({
        id: validRoleId,
        displayName: validDisplayName,
        permissions: [
          Permission.create("user:read"),
          Permission.create("user:create"),
          Permission.create("user:update"),
        ],
      });

      // Act
      role.removePermissions(["user:read", "user:create"]);

      // Assert
      expect(role.getPermissions()).toHaveLength(1);
      expect(role.getPermissions()[0].getValue()).toBe("user:update");
    });

    it("should handle case-insensitive permission codes", () => {
      // Arrange
      const role = Role.create({
        id: validRoleId,
        displayName: validDisplayName,
        permissions: [
          Permission.create("user:read"),
          Permission.create("user:create"),
        ],
      });

      // Act
      role.removePermissions(["USER:READ"]);

      // Assert
      expect(role.getPermissions()).toHaveLength(1);
      expect(role.getPermissions()[0].getValue()).toBe("user:create");
    });

    it("should not throw error when removing non-existent permissions", () => {
      // Arrange
      const role = Role.create({
        id: validRoleId,
        displayName: validDisplayName,
        permissions: [Permission.create("user:read")],
      });

      // Act
      role.removePermissions(["user:delete", "user:update"]);

      // Assert
      expect(role.getPermissions()).toHaveLength(1);
      expect(role.getPermissions()[0].getValue()).toBe("user:read");
    });
  });

  describe("canDelete", () => {
    it("should return true for non-super-admin role", () => {
      // Arrange
      const role = Role.create({
        id: validRoleId,
        displayName: validDisplayName,
        isSuperAdmin: false,
      });

      // Act
      const canDelete = role.canDelete();

      // Assert
      expect(canDelete).toBe(true);
    });

    it("should return false for super-admin role", () => {
      // Arrange
      const role = Role.create({
        id: validRoleId,
        displayName: validDisplayName,
        isSuperAdmin: true,
      });

      // Act
      const canDelete = role.canDelete();

      // Assert
      expect(canDelete).toBe(false);
    });
  });

  describe("getters", () => {
    it("should return immutable permissions array", () => {
      // Arrange
      const permissions = [
        Permission.create("user:read"),
        Permission.create("user:create"),
      ];
      const role = Role.create({
        id: validRoleId,
        displayName: validDisplayName,
        permissions,
      });

      // Act
      const retrievedPermissions = role.getPermissions();
      retrievedPermissions.push(Permission.create("user:update"));

      // Assert
      expect(role.getPermissions()).toHaveLength(2);
      expect(retrievedPermissions).toHaveLength(3);
    });
  });
});
