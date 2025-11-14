/**
 * Unit tests for AssignPermissionsToRoleHandler
 */
import { Test, TestingModule } from "@nestjs/testing";
import { AssignPermissionsToRoleHandler } from "../assign-permissions-to-role.handler";
import { AssignPermissionsToRoleCommand } from "../../assign-permissions-to-role.command";
import { ROLE_REPOSITORY } from "../../../../domain/repositories/role.repository.interface";
import { ROLE_PERMISSION_VALIDATION_PORT } from "../../../interfaces/role-permission-validation.port";
import { Role } from "../../../../domain/entities/role.entity";
import { RoleId } from "../../../../domain/value-objects/role-id.vo";
import { Permission } from "../../../../domain/value-objects/permission.vo";
import { randomUUID } from "crypto";

describe("AssignPermissionsToRoleHandler", () => {
  let handler: AssignPermissionsToRoleHandler;
  let findByIdMock: jest.Mock;
  let saveMock: jest.Mock;
  let validatePermissionsMock: jest.Mock;

  const roleId = RoleId.create(randomUUID());
  const displayName = "Editor";

  beforeEach(async () => {
    findByIdMock = jest.fn();
    saveMock = jest.fn();
    validatePermissionsMock = jest.fn();

    const mockRoleRepository = {
      findById: findByIdMock,
      save: saveMock,
      findAll: jest.fn(),
      findByCode: jest.fn(),
      delete: jest.fn(),
      exists: jest.fn(),
    };

    const mockRolePermissionValidation = {
      validateRoles: jest.fn(),
      validatePermissions: validatePermissionsMock,
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
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("execute", () => {
    it("should assign permissions to role successfully", async () => {
      // Arrange
      const role = Role.create({
        id: roleId,
        displayName,
      });
      const permissions = ["user:read", "user:create"];
      const command = new AssignPermissionsToRoleCommand(
        roleId.getValue(),
        permissions,
      );
      findByIdMock.mockResolvedValue(role);
      validatePermissionsMock.mockResolvedValue(permissions);
      saveMock.mockResolvedValue(undefined);

      // Act
      const result = await handler.execute(command);

      // Assert
      expect(result).toBeDefined();
      expect(result.permissions).toEqual(permissions);
      expect(validatePermissionsMock).toHaveBeenCalledWith(permissions);
      expect(saveMock).toHaveBeenCalled();
    });

    it("should throw error when role not found", async () => {
      // Arrange
      const permissions = ["user:read"];
      const command = new AssignPermissionsToRoleCommand(
        roleId.getValue(),
        permissions,
      );
      findByIdMock.mockResolvedValue(null);

      // Act & Assert
      await expect(handler.execute(command)).rejects.toThrow("Role not found");
      expect(findByIdMock).toHaveBeenCalledWith(roleId);
      expect(validatePermissionsMock).not.toHaveBeenCalled();
      expect(saveMock).not.toHaveBeenCalled();
    });

    it("should validate permissions before assigning", async () => {
      // Arrange
      const role = Role.create({
        id: roleId,
        displayName,
      });
      const invalidPermissions = ["user:read", "invalid:permission"];
      const command = new AssignPermissionsToRoleCommand(
        roleId.getValue(),
        invalidPermissions,
      );
      findByIdMock.mockResolvedValue(role);
      validatePermissionsMock.mockRejectedValue(
        new Error("Unknown permission(s): invalid:permission"),
      );

      // Act & Assert
      await expect(handler.execute(command)).rejects.toThrow(
        "Unknown permission(s): invalid:permission",
      );
      expect(validatePermissionsMock).toHaveBeenCalledWith(invalidPermissions);
      expect(saveMock).not.toHaveBeenCalled();
    });

    it("should replace existing permissions", async () => {
      // Arrange
      const existingPermissions = [Permission.create("user:read")];
      const role = Role.create({
        id: roleId,
        displayName,
        permissions: existingPermissions,
      });
      const newPermissions = ["user:create", "user:update"];
      const command = new AssignPermissionsToRoleCommand(
        roleId.getValue(),
        newPermissions,
      );
      findByIdMock.mockResolvedValue(role);
      validatePermissionsMock.mockResolvedValue(newPermissions);
      saveMock.mockResolvedValue(undefined);

      // Act
      const result = await handler.execute(command);

      // Assert
      expect(result.permissions).toEqual(newPermissions);
      expect(result.permissions).not.toContain("user:read");
    });

    it("should handle empty permissions array", async () => {
      // Arrange
      const role = Role.create({
        id: roleId,
        displayName,
        permissions: [Permission.create("user:read")],
      });
      const command = new AssignPermissionsToRoleCommand(roleId.getValue(), []);
      findByIdMock.mockResolvedValue(role);
      validatePermissionsMock.mockResolvedValue([]);
      saveMock.mockResolvedValue(undefined);

      // Act
      const result = await handler.execute(command);

      // Assert
      expect(result.permissions).toEqual([]);
    });
  });
});
