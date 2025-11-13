/**
 * Unit tests for RoleAssignmentService
 */
import { Test, TestingModule } from '@nestjs/testing';
import { CqrsModule } from '@nestjs/cqrs';
import { RoleAssignmentService } from '../role-assignment.service';
import { CommandBus } from '@nestjs/cqrs';
import type { IRoleRepository } from '../../../domain/repositories/role.repository.interface';
import { ROLE_REPOSITORY } from '../../../domain/repositories/role.repository.interface';
import { AssignRolesToUserCommand } from '../../../application/commands/assign-roles-to-user.command';
import { Role } from '../../../domain/entities/role.entity';
import { RoleId } from '../../../domain/value-objects/role-id.vo';
import { randomUUID } from 'crypto';

describe('RoleAssignmentService', () => {
  let service: RoleAssignmentService;
  let commandBus: jest.Mocked<CommandBus>;
  let roleRepository: jest.Mocked<IRoleRepository>;

  const userId = randomUUID();
  const roles = ['editor', 'manager'];

  beforeEach(async () => {
    const mockExecute = jest.fn().mockResolvedValue(undefined);
    const mockCommandBus = {
      execute: mockExecute,
    };

    const mockRoleRepository = {
      findAll: jest.fn(),
      findById: jest.fn(),
      findByCode: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
      exists: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      imports: [CqrsModule],
      providers: [
        RoleAssignmentService,
        {
          provide: CommandBus,
          useValue: mockCommandBus,
        },
        {
          provide: ROLE_REPOSITORY,
          useValue: mockRoleRepository,
        },
      ],
    }).compile();

    service = module.get<RoleAssignmentService>(RoleAssignmentService);
    commandBus = module.get(CommandBus);
    roleRepository = module.get(ROLE_REPOSITORY);
    // Make execute a jest mock
    (commandBus.execute as jest.Mock) = mockExecute;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('assignRolesToUser', () => {
    it('should execute AssignRolesToUserCommand', async () => {
      // Act
      await service.assignRolesToUser(userId, roles);

      // Assert
      expect(commandBus.execute).toHaveBeenCalled();
      const command = commandBus.execute.mock.calls[0][0];
      expect(command).toBeInstanceOf(AssignRolesToUserCommand);
      expect(command.userId).toBe(userId);
      expect(command.roles).toEqual(roles);
    });
  });

  describe('getAllRoles', () => {
    it('should return all roles from repository', async () => {
      // Arrange
      const roles = [
        Role.create({
          id: RoleId.create(randomUUID()),
          code: 'editor',
          displayName: 'Editor',
        }),
        Role.create({
          id: RoleId.create(randomUUID()),
          code: 'manager',
          displayName: 'Manager',
        }),
      ];
      roleRepository.findAll.mockResolvedValue(roles);

      // Act
      const result = await service.getAllRoles();

      // Assert
      expect(result).toEqual(roles);
      expect(roleRepository.findAll).toHaveBeenCalled();
    });
  });
});

