/**
 * Unit tests for Permission value object
 */
import { Permission } from '../permission.vo';

describe('Permission', () => {
  describe('create', () => {
    it('should create Permission with valid format', () => {
      // Arrange
      const validPermissions = [
        'user:create',
        'user:read',
        'user:update',
        'user:delete',
        'user:manage',
        'booking:read',
        'booking:create',
        'role:assign',
        'permission:grant',
      ];

      // Act & Assert
      validPermissions.forEach((permission) => {
        const perm = Permission.create(permission);
        expect(perm).toBeDefined();
        expect(perm.getValue()).toBe(permission.toLowerCase());
      });
    });

    it('should normalize permission to lowercase', () => {
      // Arrange
      const permission = 'USER:CREATE';

      // Act
      const perm = Permission.create(permission);

      // Assert
      expect(perm.getValue()).toBe('user:create');
    });

    it('should trim whitespace from permission', () => {
      // Arrange
      const permission = '  user:create  ';

      // Act
      const perm = Permission.create(permission);

      // Assert
      expect(perm.getValue()).toBe('user:create');
    });

    it('should throw error when permission is empty', () => {
      // Act & Assert
      expect(() => Permission.create('')).toThrow(
        'Permission cannot be empty',
      );
      expect(() => Permission.create('   ')).toThrow(
        'Permission cannot be empty',
      );
    });

    it('should throw error when permission format is invalid', () => {
      // Arrange
      const invalidPermissions = [
        'user', // Missing colon
        'user:', // Missing action
        ':create', // Missing module
      ];

      // Act & Assert
      invalidPermissions.forEach((invalid) => {
        expect(() => Permission.create(invalid)).toThrow();
      });
    });

    it('should accept permissions with underscores and dashes in action', () => {
      // Arrange
      const validPermissions = [
        'user:create_role',
        'user:assign-permission',
        'booking:check_in',
        'booking:check-out',
      ];

      // Act & Assert
      validPermissions.forEach((permission) => {
        const perm = Permission.create(permission);
        expect(perm.getValue()).toBe(permission.toLowerCase());
      });
    });

    it('should accept permissions with wildcard in action', () => {
      // Arrange
      const wildcardPermissions = [
        'user:manage',
        'booking:manage',
      ];

      // Act & Assert
      wildcardPermissions.forEach((permission) => {
        const perm = Permission.create(permission);
        expect(perm.getValue()).toBe(permission.toLowerCase());
      });
    });
  });

  describe('getValue', () => {
    it('should return the normalized permission value', () => {
      // Arrange
      const permission = 'USER:CREATE';
      const perm = Permission.create(permission);

      // Act
      const value = perm.getValue();

      // Assert
      expect(value).toBe('user:create');
    });
  });
});

