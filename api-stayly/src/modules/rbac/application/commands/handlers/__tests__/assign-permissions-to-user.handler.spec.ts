/**
 * Unit tests for AssignPermissionsToUserHandler
 */
import { Test, TestingModule } from '@nestjs/testing';
import { AssignPermissionsToUserHandler } from '../assign-permissions-to-user.handler';
import { AssignPermissionsToUserCommand } from '../../assign-permissions-to-user.command';
import type { IRolePermissionValidationPort } from '../../../interfaces/role-permission-validation.port';
import { ROLE_PERMISSION_VALIDATION_PORT } from '../../../interfaces/role-permission-validation.port';
import { UserResponseDto } from '../../../../../user/application/dto/response/user-response.dto';
import { randomUUID } from 'crypto';
import type { IUserAccessPort } from '../../../../../user/application/interfaces/user-access.port';
import { USER_ACCESS_PORT } from '../../../../../user/application/interfaces/user-access.port';
import type { IUserPermissionLinkPort } from '../../../interfaces/user-permission-link.port';
import { USER_PERMISSION_LINK_PORT } from '../../../interfaces/user-permission-link.port';

describe('AssignPermissionsToUserHandler', () => {
  let handler: AssignPermissionsToUserHandler;
  let rolePermissionValidation: jest.Mocked<IRolePermissionValidationPort>;
  let userAccessPort: jest.Mocked<IUserAccessPort>;
  let userPermissionLinkPort: jest.Mocked<IUserPermissionLinkPort>;

  const userId = randomUUID();
  const permissions = ['user:read', 'user:create'];

  beforeEach(async () => {
    const mockUserAccessPort: jest.Mocked<IUserAccessPort> = {
      ensureUserExists: jest.fn(),
      getUserResponse: jest.fn(),
    };

    const mockUserPermissionLinkPort: jest.Mocked<IUserPermissionLinkPort> = {
      replaceUserPermissions: jest.fn(),
    };

    const mockRolePermissionValidation = {
      validateRoles: jest.fn(),
      validatePermissions: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AssignPermissionsToUserHandler,
        {
          provide: USER_ACCESS_PORT,
          useValue: mockUserAccessPort,
        },
        {
          provide: USER_PERMISSION_LINK_PORT,
          useValue: mockUserPermissionLinkPort,
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
    rolePermissionValidation = module.get(ROLE_PERMISSION_VALIDATION_PORT);
    userAccessPort = module.get(USER_ACCESS_PORT);
    userPermissionLinkPort = module.get(USER_PERMISSION_LINK_PORT);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should assign permissions to user successfully', async () => {
      // Arrange
      const command = new AssignPermissionsToUserCommand(userId, permissions);
      const validatedPermissions = ['user:read', 'user:create'];
      const responseDto = new UserResponseDto(
        userId,
        'user@example.com',
        'User Name',
        'active',
      );

      rolePermissionValidation.validatePermissions.mockResolvedValue(
        validatedPermissions,
      );
      userAccessPort.getUserResponse.mockResolvedValue(responseDto);

      // Act
      const result = await handler.execute(command);

      // Assert
      expect(result).toBeDefined();
      expect(rolePermissionValidation.validatePermissions).toHaveBeenCalledWith(
        permissions,
      );
      expect(userAccessPort.ensureUserExists).toHaveBeenCalledWith(userId);
      expect(userPermissionLinkPort.replaceUserPermissions).toHaveBeenCalledWith(
        userId,
        validatedPermissions,
      );
      expect(userAccessPort.getUserResponse).toHaveBeenCalledWith(userId);
      expect(result).toEqual(responseDto);
    });

    it('should throw error when permissions validation fails', async () => {
      // Arrange
      const command = new AssignPermissionsToUserCommand(userId, [
        'invalid:permission',
      ]);
      userAccessPort.ensureUserExists.mockResolvedValue(undefined);
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
      expect(userPermissionLinkPort.replaceUserPermissions).not.toHaveBeenCalled();
    });

    it('should handle empty permissions array', async () => {
      // Arrange
      const command = new AssignPermissionsToUserCommand(userId, []);
      const responseDto = new UserResponseDto(
        userId,
        'user@example.com',
        'User Name',
        'active',
      );

      rolePermissionValidation.validatePermissions.mockResolvedValue([]);
      userAccessPort.getUserResponse.mockResolvedValue(responseDto);

      // Act
      const result = await handler.execute(command);

      // Assert
      expect(result).toBeDefined();
      expect(rolePermissionValidation.validatePermissions).toHaveBeenCalledWith(
        [],
      );
      expect(userPermissionLinkPort.replaceUserPermissions).toHaveBeenCalledWith(
        userId,
        [],
      );
      expect(result).toEqual(responseDto);
    });

    it('should throw error when user not found', async () => {
      // Arrange
      const command = new AssignPermissionsToUserCommand(userId, permissions);
      rolePermissionValidation.validatePermissions.mockResolvedValue(
        permissions,
      );
      userAccessPort.ensureUserExists.mockRejectedValue(
        new Error('User not found'),
      );

      // Act & Assert
      await expect(handler.execute(command)).rejects.toThrow('User not found');
      expect(userPermissionLinkPort.replaceUserPermissions).not.toHaveBeenCalled();
    });
  });
});

