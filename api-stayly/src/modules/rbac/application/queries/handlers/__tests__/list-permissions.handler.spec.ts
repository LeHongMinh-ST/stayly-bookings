/**
 * Unit tests for ListPermissionsHandler
 */
import { Test, TestingModule } from '@nestjs/testing';
import { ListPermissionsHandler } from '../list-permissions.handler';
import { ListPermissionsQuery } from '../../list-permissions.query';
import { PERMISSION_REPOSITORY } from '../../../../domain/repositories/permission.repository.interface';
import { Permission } from '../../../../domain/value-objects/permission.vo';

describe('ListPermissionsHandler', () => {
  let handler: ListPermissionsHandler;
  let findAllMock: jest.Mock;

  beforeEach(async () => {
    findAllMock = jest.fn();

    const mockPermissionRepository = {
      findAll: findAllMock,
      findByCodes: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ListPermissionsHandler,
        {
          provide: PERMISSION_REPOSITORY,
          useValue: mockPermissionRepository,
        },
      ],
    }).compile();

    handler = module.get<ListPermissionsHandler>(ListPermissionsHandler);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should return list of permissions', async () => {
      // Arrange
      const permissions = [
        Permission.create('user:read'),
        Permission.create('user:create'),
        Permission.create('user:update'),
        Permission.create('user:delete'),
      ];
      const query = new ListPermissionsQuery();
      findAllMock.mockResolvedValue(permissions);

      // Act
      const result = await handler.execute(query);

      // Assert
      expect(result).toBeDefined();
      expect(result).toHaveLength(4);
      expect(result[0].getValue()).toBe('user:read');
      expect(result[1].getValue()).toBe('user:create');
      expect(findAllMock).toHaveBeenCalledWith(
        query.limit,
        query.offset,
        query.search,
      );
    });

    it('should return empty array when no permissions exist', async () => {
      // Arrange
      const query = new ListPermissionsQuery();
      findAllMock.mockResolvedValue([]);

      // Act
      const result = await handler.execute(query);

      // Assert
      expect(result).toEqual([]);
      expect(findAllMock).toHaveBeenCalledWith(
        query.limit,
        query.offset,
        query.search,
      );
    });
  });
});
