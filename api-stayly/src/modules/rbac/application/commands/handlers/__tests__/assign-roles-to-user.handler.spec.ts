/**
 * Unit tests for AssignRolesToUserHandler
 */
import { Test, TestingModule } from '@nestjs/testing';
import { AssignRolesToUserHandler } from '../assign-roles-to-user.handler';
import { AssignRolesToUserCommand } from '../../assign-roles-to-user.command';
import type { IUserRolePermissionPort } from '../../../../../user/application/interfaces/user-role-permission.port';
import { USER_ROLE_PERMISSION_PORT } from '../../../../../user/application/interfaces/user-role-permission.port';
import type { IRolePermissionValidationPort } from '../../../interfaces/role-permission-validation.port';
import { ROLE_PERMISSION_VALIDATION_PORT } from '../../../interfaces/role-permission-validation.port';
import { UserResponseDto } from '../../../../../user/application/dto/response/user-response.dto';
import { randomUUID } from 'crypto';

describe('AssignRolesToUserHandler', () => {
  let handler: AssignRolesToUserHandler;
  let userRolePermissionPort: jest.Mocked<IUserRolePermissionPort>;
  let rolePermissionValidation: jest.Mocked<IRolePermissionValidationPort>;

  const userId = randomUUID();
  const roles = ['editor', 'manager'];

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
        AssignRolesToUserHandler,
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

    handler = module.get<AssignRolesToUserHandler>(AssignRolesToUserHandler);
    userRolePermissionPort = module.get(USER_ROLE_PERMISSION_PORT);
    rolePermissionValidation = module.get(ROLE_PERMISSION_VALIDATION_PORT);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should assign roles to user successfully', async () => {
      // Arrange
      const command = new AssignRolesToUserCommand(userId, roles);
      const validatedRoles = ['editor', 'manager'];
      const userResponse = new UserResponseDto(
        userId,
        'user@example.com',
        'User Name',
        ['editor', 'manager'],
        [],
        new Date(),
        new Date(),
      );

      rolePermissionValidation.validateRoles.mockResolvedValue(validatedRoles);
      userRolePermissionPort.updateUserRoles.mockResolvedValue(userResponse);

      // Act
      const result = await handler.execute(command);

      // Assert
      expect(result).toBeDefined();
      expect(rolePermissionValidation.validateRoles).toHaveBeenCalledWith(roles);
      expect(userRolePermissionPort.updateUserRoles).toHaveBeenCalledWith(
        userId,
        validatedRoles,
      );
    });

    it('should throw error when roles validation fails', async () => {
      // Arrange
      const command = new AssignRolesToUserCommand(userId, ['invalid_role']);
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
      expect(userRolePermissionPort.updateUserRoles).not.toHaveBeenCalled();
    });

    it('should throw error when empty roles array', async () => {
      // Arrange
      const command = new AssignRolesToUserCommand(userId, []);
      rolePermissionValidation.validateRoles.mockRejectedValue(
        new Error('At least one role is required'),
      );

      // Act & Assert
      await expect(handler.execute(command)).rejects.toThrow(
        'At least one role is required',
      );
      expect(userRolePermissionPort.updateUserRoles).not.toHaveBeenCalled();
    });
  });
});

