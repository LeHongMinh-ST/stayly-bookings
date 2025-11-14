/**
 * Unit tests for CreateRoleHandler
 */
import { Test, TestingModule } from "@nestjs/testing";
import { CreateRoleHandler } from "../create-role.handler";
import { CreateRoleCommand } from "../../create-role.command";
import { ROLE_REPOSITORY } from "../../../../domain/repositories/role.repository.interface";
import { ROLE_PERMISSION_VALIDATION_PORT } from "../../../interfaces/role-permission-validation.port";

describe("CreateRoleHandler", () => {
  let handler: CreateRoleHandler;
  let saveMock: jest.Mock;
  let validatePermissionsMock: jest.Mock;
  const displayName = "Editor";

  beforeEach(async () => {
    saveMock = jest.fn();
    validatePermissionsMock = jest.fn();

    const mockRoleRepository = {
      save: saveMock,
      findAll: jest.fn(),
      findById: jest.fn(),
      delete: jest.fn(),
      exists: jest.fn(),
    };

    const mockRolePermissionValidation = {
      validateRoles: jest.fn(),
      validatePermissions: validatePermissionsMock,
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateRoleHandler,
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

    handler = module.get<CreateRoleHandler>(CreateRoleHandler);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("execute", () => {
    it("should create role successfully without permissions", async () => {
      // Arrange
      const command = new CreateRoleCommand(displayName);
      saveMock.mockResolvedValue();

      // Act
      const result = await handler.execute(command);

      // Assert
      expect(result).toBeDefined();
      expect(result.displayName).toBe(displayName);
      expect(result.isSuperAdmin).toBe(false);
      expect(result.permissions).toEqual([]);
      expect(saveMock).toHaveBeenCalled();
      expect(validatePermissionsMock).not.toHaveBeenCalled();
    });

    it("should create role with permissions", async () => {
      // Arrange
      const permissions = ["user:read", "user:create"];
      const command = new CreateRoleCommand(displayName, permissions);
      validatePermissionsMock.mockResolvedValue(permissions);
      saveMock.mockResolvedValue();

      // Act
      const result = await handler.execute(command);

      // Assert
      expect(result).toBeDefined();
      expect(result.displayName).toBe(displayName);
      expect(result.permissions).toEqual(permissions);
      expect(validatePermissionsMock).toHaveBeenCalledWith(permissions);
      expect(saveMock).toHaveBeenCalled();
    });

    it("should validate permissions before creating role", async () => {
      // Arrange
      const permissions = ["user:read", "invalid:permission"];
      const command = new CreateRoleCommand(displayName, permissions);
      validatePermissionsMock.mockRejectedValue(
        new Error("Unknown permission(s): invalid:permission"),
      );

      // Act & Assert
      await expect(handler.execute(command)).rejects.toThrow(
        "Unknown permission(s): invalid:permission",
      );
      expect(validatePermissionsMock).toHaveBeenCalledWith(permissions);
      expect(saveMock).not.toHaveBeenCalled();
    });
  });
});
