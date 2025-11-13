/**
 * Unit tests for AssignRolesToUserHandler
 */
import { Test, TestingModule } from '@nestjs/testing';
import { AssignRolesToUserHandler } from '../assign-roles-to-user.handler';
import { AssignRolesToUserCommand } from '../../assign-roles-to-user.command';
import type { IRolePermissionValidationPort } from '../../../interfaces/role-permission-validation.port';
import { ROLE_PERMISSION_VALIDATION_PORT } from '../../../interfaces/role-permission-validation.port';
import { UserResponseDto } from '../../../../../user/application/dto/response/user-response.dto';
import { randomUUID } from 'crypto';
import type { IUserAccessPort } from '../../../../../user/application/interfaces/user-access.port';
import { USER_ACCESS_PORT } from '../../../../../user/application/interfaces/user-access.port';
import type { IUserRoleLinkPort } from '../../../interfaces/user-role-link.port';
import { USER_ROLE_LINK_PORT } from '../../../interfaces/user-role-link.port';

describe('AssignRolesToUserHandler', () => {
  let handler: AssignRolesToUserHandler;
  let rolePermissionValidation: jest.Mocked<IRolePermissionValidationPort>;
  let userAccessPort: jest.Mocked<IUserAccessPort>;
  let userRoleLinkPort: jest.Mocked<IUserRoleLinkPort>;

  const userId = randomUUID();
  const roles = ['editor', 'manager'];

  beforeEach(async () => {
    const mockUserAccessPort: jest.Mocked<IUserAccessPort> = {
      ensureUserExists: jest.fn(),
      getUserResponse: jest.fn(),
    };

    const mockUserRoleLinkPort: jest.Mocked<IUserRoleLinkPort> = {
      replaceUserRoles: jest.fn(),
    };

    const mockRolePermissionValidation = {
      validateRoles: jest.fn(),
      validatePermissions: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AssignRolesToUserHandler,
        {
          provide: USER_ACCESS_PORT,
          useValue: mockUserAccessPort,
        },
        {
          provide: USER_ROLE_LINK_PORT,
          useValue: mockUserRoleLinkPort,
        },
        {
          provide: ROLE_PERMISSION_VALIDATION_PORT,
          useValue: mockRolePermissionValidation,
        },
      ],
    }).compile();

    handler = module.get<AssignRolesToUserHandler>(AssignRolesToUserHandler);
    rolePermissionValidation = module.get(ROLE_PERMISSION_VALIDATION_PORT);
    userAccessPort = module.get(USER_ACCESS_PORT);
    userRoleLinkPort = module.get(USER_ROLE_LINK_PORT);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should assign roles to user successfully', async () => {
      // Arrange
      const command = new AssignRolesToUserCommand(userId, roles);
      const validatedRoles = ['editor', 'manager'];
      const responseDto = new UserResponseDto(
        userId,
        'user@example.com',
        'User Name',
        'active',
      );

      rolePermissionValidation.validateRoles.mockResolvedValue(validatedRoles);
      userAccessPort.getUserResponse.mockResolvedValue(responseDto);

      // Act
      const result = await handler.execute(command);

      // Assert
      expect(result).toBeDefined();
      expect(rolePermissionValidation.validateRoles).toHaveBeenCalledWith(roles);
      expect(userAccessPort.ensureUserExists).toHaveBeenCalledWith(userId);
      expect(userRoleLinkPort.replaceUserRoles).toHaveBeenCalledWith(
        userId,
        validatedRoles,
      );
      expect(userAccessPort.getUserResponse).toHaveBeenCalledWith(userId);
      expect(result).toEqual(responseDto);
    });

    it('should throw error when roles validation fails', async () => {
      // Arrange
      const command = new AssignRolesToUserCommand(userId, ['invalid_role']);
      userAccessPort.ensureUserExists.mockResolvedValue(undefined);
      rolePermissionValidation.validateRoles.mockRejectedValue(
        new Error('Unknown role(s): invalid_role'),
      );

      // Act & Assert
      await expect(handler.execute(command)).rejects.toThrow(
        'Unknown role(s): invalid_role',
      );
      expect(rolePermissionValidation.validateRoles).toHaveBeenCalledWith([
        'invalid_role',
      ]);
      expect(userRoleLinkPort.replaceUserRoles).not.toHaveBeenCalled();
    });

    it('should throw error when empty roles array', async () => {
      // Arrange
      const command = new AssignRolesToUserCommand(userId, []);
      userAccessPort.ensureUserExists.mockResolvedValue(undefined);
      rolePermissionValidation.validateRoles.mockRejectedValue(
        new Error('At least one role is required'),
      );

      // Act & Assert
      await expect(handler.execute(command)).rejects.toThrow(
        'At least one role is required',
      );
      expect(rolePermissionValidation.validateRoles).toHaveBeenCalledWith([]);
      expect(userRoleLinkPort.replaceUserRoles).not.toHaveBeenCalled();
    });

    it('should throw error when user not found', async () => {
      // Arrange
      const command = new AssignRolesToUserCommand(userId, roles);
      rolePermissionValidation.validateRoles.mockResolvedValue(roles);
      userAccessPort.ensureUserExists.mockRejectedValue(
        new Error('User not found'),
      );

      // Act & Assert
      await expect(handler.execute(command)).rejects.toThrow('User not found');
      expect(userRoleLinkPort.replaceUserRoles).not.toHaveBeenCalled();
    });
  });
});

