/**
 * Unit tests for ListRolesHandler
 */
import { Test, TestingModule } from "@nestjs/testing";
import { ListRolesHandler } from "../list-roles.handler";
import { ListRolesQuery } from "../../list-roles.query";
import type { IRoleRepository } from "../../../../domain/repositories/role.repository.interface";
import { ROLE_REPOSITORY } from "../../../../domain/repositories/role.repository.interface";
import { Role } from "../../../../domain/entities/role.entity";
import { RoleId } from "../../../../domain/value-objects/role-id.vo";
import { Permission } from "../../../../domain/value-objects/permission.vo";
import { randomUUID } from "crypto";

describe("ListRolesHandler", () => {
  let handler: ListRolesHandler;
  let roleRepository: jest.Mocked<IRoleRepository>;

  beforeEach(async () => {
    const mockRoleRepository = {
      findAll: jest.fn(),
      count: jest.fn(),
      findById: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
      exists: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ListRolesHandler,
        {
          provide: ROLE_REPOSITORY,
          useValue: mockRoleRepository,
        },
      ],
    }).compile();

    handler = module.get<ListRolesHandler>(ListRolesHandler);
    roleRepository = module.get(ROLE_REPOSITORY);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("execute", () => {
    it("should return paginated list of roles", async () => {
      // Arrange
      const role1 = Role.create({
        id: RoleId.create(randomUUID()),
        displayName: "Editor",
        permissions: [Permission.create("user:read")],
      });
      const role2 = Role.create({
        id: RoleId.create(randomUUID()),
        displayName: "Manager",
        permissions: [
          Permission.create("user:read"),
          Permission.create("user:create"),
        ],
      });
      const roles = [role1, role2];
      const query = new ListRolesQuery(1, 10);
      roleRepository.findAll.mockResolvedValue(roles);
      roleRepository.count.mockResolvedValue(2);

      // Act
      const result = await handler.execute(query);

      // Assert
      expect(result).toBeDefined();
      expect(result.data).toHaveLength(2);
      expect(result.data[0].displayName).toBe("Editor");
      expect(result.data[1].displayName).toBe("Manager");
      expect(result.meta.total).toBe(2);
      expect(result.meta.current_page).toBe(1);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(roleRepository.findAll).toHaveBeenCalledWith(10, 0);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(roleRepository.count).toHaveBeenCalled();
    });

    it("should return empty paginated result when no roles exist", async () => {
      // Arrange
      const query = new ListRolesQuery(1, 10);
      roleRepository.findAll.mockResolvedValue([]);
      roleRepository.count.mockResolvedValue(0);

      // Act
      const result = await handler.execute(query);

      // Assert
      expect(result).toBeDefined();
      expect(result.data).toEqual([]);
      expect(result.meta.total).toBe(0);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(roleRepository.findAll).toHaveBeenCalledWith(10, 0);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(roleRepository.count).toHaveBeenCalled();
    });

    it("should map roles to DTOs correctly", async () => {
      // Arrange
      const role = Role.create({
        id: RoleId.create(randomUUID()),
        displayName: "Editor",
        isSuperAdmin: false,
        permissions: [
          Permission.create("user:read"),
          Permission.create("user:create"),
        ],
      });
      const query = new ListRolesQuery(1, 10);
      roleRepository.findAll.mockResolvedValue([role]);
      roleRepository.count.mockResolvedValue(1);

      // Act
      const result = await handler.execute(query);

      // Assert
      expect(result.data[0]).toMatchObject({
        id: role.getId().getValue(),
        displayName: "Editor",
        isSuperAdmin: false,
        permissions: ["user:read", "user:create"],
      });
      expect(result.meta.total).toBe(1);
    });
  });
});
