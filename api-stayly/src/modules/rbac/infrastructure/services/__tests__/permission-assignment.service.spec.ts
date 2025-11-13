/**
 * Unit tests for PermissionAssignmentService
 */
import { Test, TestingModule } from '@nestjs/testing';
import { CqrsModule } from '@nestjs/cqrs';
import { PermissionAssignmentService } from '../permission-assignment.service';
import { CommandBus } from '@nestjs/cqrs';
import type { IPermissionRepository } from '../../../domain/repositories/permission.repository.interface';
import { PERMISSION_REPOSITORY } from '../../../domain/repositories/permission.repository.interface';
import { AssignPermissionsToUserCommand } from '../../../application/commands/assign-permissions-to-user.command';
import { Permission } from '../../../domain/value-objects/permission.vo';

describe('PermissionAssignmentService', () => {
  let service: PermissionAssignmentService;
  let commandBus: jest.Mocked<CommandBus>;
  let permissionRepository: jest.Mocked<IPermissionRepository>;

  const userId = 'user-id';
  const permissions = ['user:read', 'user:create'];

  beforeEach(async () => {
    const mockExecute = jest.fn().mockResolvedValue(undefined);
    const mockCommandBus = {
      execute: mockExecute,
    };

    const mockPermissionRepository = {
      findAll: jest.fn(),
      findByCodes: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      imports: [CqrsModule],
      providers: [
        PermissionAssignmentService,
        {
          provide: CommandBus,
          useValue: mockCommandBus,
        },
        {
          provide: PERMISSION_REPOSITORY,
          useValue: mockPermissionRepository,
        },
      ],
    }).compile();

    service = module.get<PermissionAssignmentService>(
      PermissionAssignmentService,
    );
    commandBus = module.get(CommandBus);
    permissionRepository = module.get(PERMISSION_REPOSITORY);
    // Make execute a jest mock
    (commandBus.execute as jest.Mock) = mockExecute;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('assignPermissionsToUser', () => {
    it('should execute AssignPermissionsToUserCommand', async () => {
      // Act
      await service.assignPermissionsToUser(userId, permissions);

      // Assert
      expect(commandBus.execute).toHaveBeenCalled();
      const command = commandBus.execute.mock.calls[0][0];
      expect(command).toBeInstanceOf(AssignPermissionsToUserCommand);
      expect(command.userId).toBe(userId);
      expect(command.permissions).toEqual(permissions);
    });
  });

  describe('getAllPermissions', () => {
    it('should return all permissions from repository', async () => {
      // Arrange
      const permissions = [
        Permission.create('user:read'),
        Permission.create('user:create'),
        Permission.create('user:update'),
      ];
      permissionRepository.findAll.mockResolvedValue(permissions);

      // Act
      const result = await service.getAllPermissions();

      // Assert
      expect(result).toEqual(permissions);
      expect(permissionRepository.findAll).toHaveBeenCalled();
    });
  });

  describe('getPermissionsByCodes', () => {
    it('should return permissions by codes', async () => {
      // Arrange
      const codes = ['user:read', 'user:create'];
      const permissions = [
        Permission.create('user:read'),
        Permission.create('user:create'),
      ];
      permissionRepository.findByCodes.mockResolvedValue(permissions);

      // Act
      const result = await service.getPermissionsByCodes(codes);

      // Assert
      expect(result).toEqual(permissions);
      expect(permissionRepository.findByCodes).toHaveBeenCalledWith(codes);
    });
  });
});

