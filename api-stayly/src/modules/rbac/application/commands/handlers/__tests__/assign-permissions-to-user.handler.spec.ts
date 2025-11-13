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
import type { IUserRepository } from '../../../../../user/domain/repositories/user.repository.interface';
import { USER_REPOSITORY } from '../../../../../user/domain/repositories/user.repository.interface';
import { User } from '../../../../../user/domain/entities/user.entity';
import { Email } from '../../../../../../common/domain/value-objects/email.vo';
import { PasswordHash } from '../../../../../../common/domain/value-objects/password-hash.vo';
import { UserId } from '../../../../../user/domain/value-objects/user-id.vo';
import { UserRole, UserRoleEnum } from '../../../../../user/domain/value-objects/user-role.vo';
import { UserPermission } from '../../../../../user/domain/value-objects/user-permission.vo';

describe('AssignPermissionsToUserHandler', () => {
  let handler: AssignPermissionsToUserHandler;
  let rolePermissionValidation: jest.Mocked<IRolePermissionValidationPort>;
  let userRepository: jest.Mocked<IUserRepository>;

  const userId = randomUUID();
  const permissions = ['user:read', 'user:create'];

  const buildUser = (): User =>
    User.create({
      id: UserId.create(userId),
      email: Email.create('user@example.com'),
      fullName: 'User Name',
      passwordHash: PasswordHash.create('hashed-password-value-123456'),
      roles: [UserRole.create(UserRoleEnum.STAFF)],
      permissions: [],
    });

  beforeEach(async () => {
    const mockUserRepository: jest.Mocked<IUserRepository> = {
      save: jest.fn(),
      findById: jest.fn(),
      findByEmail: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
    };

    const mockRolePermissionValidation = {
      validateRoles: jest.fn(),
      validatePermissions: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AssignPermissionsToUserHandler,
        {
          provide: USER_REPOSITORY,
          useValue: mockUserRepository,
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
    userRepository = module.get(USER_REPOSITORY);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should assign permissions to user successfully', async () => {
      // Arrange
      const command = new AssignPermissionsToUserCommand(userId, permissions);
      const validatedPermissions = ['user:read', 'user:create'];
      const user = buildUser();

      rolePermissionValidation.validatePermissions.mockResolvedValue(
        validatedPermissions,
      );
      userRepository.findById.mockResolvedValue(user);

      // Act
      const result = await handler.execute(command);

      // Assert
      expect(result).toBeDefined();
      expect(rolePermissionValidation.validatePermissions).toHaveBeenCalledWith(
        permissions,
      );
      expect(userRepository.findById).toHaveBeenCalledTimes(1);
      const userIdArg = userRepository.findById.mock.calls[0][0];
      expect(userIdArg).toBeInstanceOf(UserId);
      expect(userIdArg.getValue()).toEqual(userId);
      expect(userRepository.save).toHaveBeenCalledTimes(1);
      const savedUser = userRepository.save.mock.calls[0][0];
      expect(savedUser).toBeInstanceOf(User);
      expect(savedUser.getPermissions().map((perm) => perm.getValue())).toEqual(
        validatedPermissions.map((code) => UserPermission.create(code).getValue()),
      );
      expect(user.getPermissions()).toHaveLength(0);
      expect(result).toEqual(
        new UserResponseDto(userId, 'user@example.com', 'User Name', 'active'),
      );
    });

    it('should throw error when permissions validation fails', async () => {
      // Arrange
      const command = new AssignPermissionsToUserCommand(userId, [
        'invalid:permission',
      ]);
      userRepository.findById.mockResolvedValue(buildUser());
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
      expect(userRepository.save).not.toHaveBeenCalled();
    });

    it('should handle empty permissions array', async () => {
      // Arrange
      const command = new AssignPermissionsToUserCommand(userId, []);
      const user = buildUser();

      rolePermissionValidation.validatePermissions.mockResolvedValue([]);
      userRepository.findById.mockResolvedValue(user);

      // Act
      const result = await handler.execute(command);

      // Assert
      expect(result).toBeDefined();
      expect(rolePermissionValidation.validatePermissions).toHaveBeenCalledWith(
        [],
      );
      expect(userRepository.save).toHaveBeenCalledTimes(1);
      const savedUser = userRepository.save.mock.calls[0][0];
      expect(savedUser.getPermissions()).toHaveLength(0);
      expect(user.getPermissions()).toHaveLength(0);
      expect(result).toEqual(
        new UserResponseDto(userId, 'user@example.com', 'User Name', 'active'),
      );
    });

    it('should throw error when user not found', async () => {
      // Arrange
      const command = new AssignPermissionsToUserCommand(userId, permissions);
      rolePermissionValidation.validatePermissions.mockResolvedValue(
        permissions,
      );
      userRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(handler.execute(command)).rejects.toThrow('User not found');
      expect(userRepository.save).not.toHaveBeenCalled();
    });
  });
});

