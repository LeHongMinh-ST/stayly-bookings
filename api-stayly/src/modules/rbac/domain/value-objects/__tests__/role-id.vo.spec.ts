/**
 * Unit tests for RoleId value object
 */
import { RoleId } from "../role-id.vo";
import { randomUUID } from "crypto";

describe("RoleId", () => {
  describe("create", () => {
    it("should create RoleId with valid UUID", () => {
      // Arrange
      const validUuid = randomUUID();

      // Act
      const roleId = RoleId.create(validUuid);

      // Assert
      expect(roleId).toBeDefined();
      expect(roleId.getValue()).toBe(validUuid);
    });

    it("should throw error when UUID is invalid", () => {
      // Arrange
      const invalidUuid = "invalid-uuid";

      // Act & Assert
      expect(() => RoleId.create(invalidUuid)).toThrow(
        "Identifier must be a valid UUID",
      );
    });

    it("should throw error when UUID is empty string", () => {
      // Act & Assert
      expect(() => RoleId.create("")).toThrow(
        "Identifier must be a valid UUID",
      );
    });

    it("should throw error when UUID format is incorrect", () => {
      // Arrange
      const invalidFormats = [
        "123",
        "not-a-uuid",
        "123e4567-e89b-12d3-a456-42661417400", // Too short
        "123e4567-e89b-12d3-a456-4266141740000", // Too long
        "123e4567-e89b-12d3-a456-42661417400g", // Invalid character
      ];

      invalidFormats.forEach((invalid) => {
        expect(() => RoleId.create(invalid)).toThrow(
          "Identifier must be a valid UUID",
        );
      });
    });

    it("should accept valid UUID v4 format", () => {
      // Arrange
      const validUuids = [randomUUID(), randomUUID(), randomUUID()];

      // Act & Assert
      validUuids.forEach((uuid) => {
        const roleId = RoleId.create(uuid);
        expect(roleId.getValue()).toBe(uuid);
      });
    });
  });

  describe("getValue", () => {
    it("should return the UUID value", () => {
      // Arrange
      const uuid = randomUUID();
      const roleId = RoleId.create(uuid);

      // Act
      const value = roleId.getValue();

      // Assert
      expect(value).toBe(uuid);
    });
  });
});
