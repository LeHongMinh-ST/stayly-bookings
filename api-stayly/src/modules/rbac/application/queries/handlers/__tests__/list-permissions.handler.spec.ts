/**
 * Unit tests for ListPermissionsHandler
 */
import { Test } from "@nestjs/testing";
import { ListPermissionsHandler } from "../list-permissions.handler";
import { ListPermissionsQuery } from "../../list-permissions.query";
import { PERMISSION_REPOSITORY } from "../../../../domain/repositories/permission.repository.interface";
import { Permission } from "../../../../domain/value-objects/permission.vo";

describe("ListPermissionsHandler", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("execute", () => {
    it("should return paginated list of permissions", async () => {
      // Arrange
      const permissions = [
        Permission.create("user:read"),
        Permission.create("user:create"),
        Permission.create("user:update"),
        Permission.create("user:delete"),
      ];
      const query = new ListPermissionsQuery("", 1, 10);
      const findAllMock = jest.fn().mockResolvedValue(permissions);
      const countMock = jest.fn().mockResolvedValue(4);
      const mockPermissionRepository = {
        findAll: findAllMock,
        count: countMock,
        findByCodes: jest.fn(),
      };
      const module = await Test.createTestingModule({
        providers: [
          ListPermissionsHandler,
          {
            provide: PERMISSION_REPOSITORY,
            useValue: mockPermissionRepository,
          },
        ],
      }).compile();
      const testHandler = module.get<ListPermissionsHandler>(
        ListPermissionsHandler,
      );

      // Act
      const result = await testHandler.execute(query);

      // Assert
      expect(result).toBeDefined();
      expect(result.data).toHaveLength(4);
      expect(result.data[0].code).toBe("user:read");
      expect(result.data[1].code).toBe("user:create");
      expect(result.meta.total).toBe(4);
      expect(result.meta.current_page).toBe(1);
      expect(result.meta.perpage).toBe(10);
      expect(findAllMock).toHaveBeenCalledWith(10, 0, "");
      expect(countMock).toHaveBeenCalledWith("");
    });

    it("should return empty paginated result when no permissions exist", async () => {
      // Arrange
      const query = new ListPermissionsQuery("", 1, 10);
      const findAllMock = jest.fn().mockResolvedValue([]);
      const countMock = jest.fn().mockResolvedValue(0);
      const mockPermissionRepository = {
        findAll: findAllMock,
        count: countMock,
        findByCodes: jest.fn(),
      };
      const module = await Test.createTestingModule({
        providers: [
          ListPermissionsHandler,
          {
            provide: PERMISSION_REPOSITORY,
            useValue: mockPermissionRepository,
          },
        ],
      }).compile();
      const testHandler = module.get<ListPermissionsHandler>(
        ListPermissionsHandler,
      );

      // Act
      const result = await testHandler.execute(query);

      // Assert
      expect(result).toBeDefined();
      expect(result.data).toEqual([]);
      expect(result.meta.total).toBe(0);
      expect(findAllMock).toHaveBeenCalledWith(10, 0, "");
      expect(countMock).toHaveBeenCalledWith("");
    });
  });
});
