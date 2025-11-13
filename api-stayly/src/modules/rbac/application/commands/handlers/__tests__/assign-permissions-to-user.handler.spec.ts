/**
 * Unit tests for AssignPermissionsToUserHandler
 */
import { Test, TestingModule } from '@nestjs/testing';
import { AssignPermissionsToUserHandler } from '../assign-permissions-to-user.handler';
import { AssignPermissionsToUserCommand } from '../../assign-permissions-to-user.command';
import type { IUserRolePermissionPort } from '../../../../../user/application/interfaces/user-role-permission.port';
import { USER_ROLE_PERMISSION_PORT } from '../../../../../user/application/interfaces/user-role-permission.port';
import type { IRolePermissionValidationPort } from '../../../interfaces/role-permission-validation.port';
import { ROLE_PERMISSION_VALIDATION_PORT } from '../../../interfaces/role-permission-validation.port';
import { UserResponseDto } from '../../../../../user/application/dto/response/user-response.dto';
import { randomUUID } from 'crypto';

describe('AssignPermissionsToUserHandler', () => {
  let handler: AssignPermissionsToUserHandler;
  let userRolePermissionPort: jest.Mocked<IUserRolePermissionPort>;
  let rolePermissionValidation: jest.Mocked<IRolePermissionValidationPort>;

  const userId = randomUUID();
  const permissions = ['user:read', 'user:create'];

  beforeEach(async () => {
    const mockUserRolePermissionPort = {
      updateUserRoles: jest.fn(),
      updateUserPermissions: jest.fn(),
    };

    const mockRolePermissionValidation = {
      validateRoles: jest.fn(),
      validatePermissions: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AssignPermissionsToUserHandler,
        {
          provide: USER_ROLE_PERMISSION_PORT,
          useValue: mockUserRolePermissionPort,
        },
        {
          provide: ROLE_PERMISSION_VALIDATION_PORT,
          useValue: mockRolePermissionValidation,
        },
      ],
    }).compile();

    handler = module.get<AssignPermissionsToUserHandler>(
      AssignPermissionsToUserHandler,
    );
    userRolePermissionPort = module.get(USER_ROLE_PERMISSION_PORT);
    rolePermissionValidation = module.get(ROLE_PERMISSION_VALIDATION_PORT);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should assign permissions to user successfully', async () => {
      // Arrange
      const command = new AssignPermissionsToUserCommand(userId, permissions);
      const validatedPermissions = ['user:read', 'user:create'];
      const userResponse = new UserResponseDto(
        userId,
        'user@example.com',
        'User Name',
        'active',
      );

      rolePermissionValidation.validatePermissions.mockResolvedValue(
        validatedPermissions,
      );
      userRolePermissionPort.updateUserPermissions.mockResolvedValue(
        userResponse,
      );

      // Act
      const result = await handler.execute(command);

      // Assert
      expect(result).toBeDefined();
      expect(rolePermissionValidation.validatePermissions).toHaveBeenCalledWith(
        permissions,
      );
      expect(
        userRolePermissionPort.updateUserPermissions,
      ).toHaveBeenCalledWith(userId, validatedPermissions);
    });

    it('should throw error when permissions validation fails', async () => {
      // Arrange
      const command = new AssignPermissionsToUserCommand(userId, [
        'invalid:permission',
      ]);
      rolePermissionValidation.validatePermissions.mockRejectedValue(
        new Error('Unknown permission(s): invalid:permission'),
      );

      // Act & Assert
      await expect(handler.execute(command)).rejects.toThrow(
        'Unknown permission(s): invalid:permission',
      );
      expect(rolePermissionValidation.validatePermissions).toHaveBeenCalledWith(
        ['invalid:permission'],
      );
      expect(
        userRolePermissionPort.updateUserPermissions,
      ).not.toHaveBeenCalled();
    });

    it('should handle empty permissions array', async () => {
      // Arrange
      const command = new AssignPermissionsToUserCommand(userId, []);
      const userResponse = new UserResponseDto(
        userId,
        'user@example.com',
        'User Name',
        'active',
      );

      rolePermissionValidation.validatePermissions.mockResolvedValue([]);
      userRolePermissionPort.updateUserPermissions.mockResolvedValue(
        userResponse,
      );

      // Act
      const result = await handler.execute(command);

      // Assert
      expect(result).toBeDefined();
      expect(rolePermissionValidation.validatePermissions).toHaveBeenCalledWith(
        [],
      );
      expect(
        userRolePermissionPort.updateUserPermissions,
      ).toHaveBeenCalledWith(userId, []);
    });
  });
});

