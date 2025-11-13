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
import type { IUserRepository } from '../../../../../user/domain/repositories/user.repository.interface';
import { USER_REPOSITORY } from '../../../../../user/domain/repositories/user.repository.interface';
import { User } from '../../../../../user/domain/entities/user.entity';
import { Email } from '../../../../../../common/domain/value-objects/email.vo';
import { PasswordHash } from '../../../../../../common/domain/value-objects/password-hash.vo';
import { UserId } from '../../../../../user/domain/value-objects/user-id.vo';
import { UserRole, UserRoleEnum } from '../../../../../user/domain/value-objects/user-role.vo';

describe('AssignRolesToUserHandler', () => {
  let handler: AssignRolesToUserHandler;
  let rolePermissionValidation: jest.Mocked<IRolePermissionValidationPort>;
  let userRepository: jest.Mocked<IUserRepository>;

  const userId = randomUUID();
  const roles = ['editor', 'manager'];

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
        AssignRolesToUserHandler,
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

    handler = module.get<AssignRolesToUserHandler>(AssignRolesToUserHandler);
    rolePermissionValidation = module.get(ROLE_PERMISSION_VALIDATION_PORT);
    userRepository = module.get(USER_REPOSITORY);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should assign roles to user successfully', async () => {
      // Arrange
      const command = new AssignRolesToUserCommand(userId, roles);
      const validatedRoles = ['editor', 'manager'];
      const user = buildUser();

      rolePermissionValidation.validateRoles.mockResolvedValue(validatedRoles);
      userRepository.findById.mockResolvedValue(user);

      // Act
      const result = await handler.execute(command);

      // Assert
      expect(result).toBeDefined();
      expect(rolePermissionValidation.validateRoles).toHaveBeenCalledWith(roles);
      expect(userRepository.findById).toHaveBeenCalledTimes(1);
      const userIdArg = userRepository.findById.mock.calls[0][0];
      expect(userIdArg).toBeInstanceOf(UserId);
      expect(userIdArg.getValue()).toEqual(userId);
      expect(userRepository.save).toHaveBeenCalledWith(user);
      expect(user.getRoles().map((role) => role.getValueAsString())).toEqual(
        validatedRoles,
      );
      expect(result).toEqual(
        new UserResponseDto(userId, 'user@example.com', 'User Name', 'active'),
      );
    });

    it('should throw error when roles validation fails', async () => {
      // Arrange
      const command = new AssignRolesToUserCommand(userId, ['invalid_role']);
      userRepository.findById.mockResolvedValue(buildUser());
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
      expect(userRepository.save).not.toHaveBeenCalled();
    });

    it('should throw error when empty roles array', async () => {
      // Arrange
      const command = new AssignRolesToUserCommand(userId, []);
      userRepository.findById.mockResolvedValue(buildUser());
      rolePermissionValidation.validateRoles.mockRejectedValue(
        new Error('At least one role is required'),
      );

      // Act & Assert
      await expect(handler.execute(command)).rejects.toThrow(
        'At least one role is required',
      );
      expect(rolePermissionValidation.validateRoles).toHaveBeenCalledWith([]);
      expect(userRepository.save).not.toHaveBeenCalled();
    });

    it('should throw error when user not found', async () => {
      // Arrange
      const command = new AssignRolesToUserCommand(userId, roles);
      rolePermissionValidation.validateRoles.mockResolvedValue(roles);
      userRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(handler.execute(command)).rejects.toThrow('User not found');
      expect(userRepository.save).not.toHaveBeenCalled();
    });
  });
});

