/**
 * Unit tests for JwtUserStrategy
 * Tests JWT strategy for user (admin/staff) authentication
 */
import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtUserStrategy } from '../jwt-user.strategy';

describe('JwtUserStrategy', () => {
  let strategy: JwtUserStrategy;
  let configService: jest.Mocked<ConfigService>;

  beforeEach(() => {
    // Arrange: Create mocks
    configService = {
      get: jest.fn().mockReturnValue('test-secret-key'),
    } as any;

    strategy = new JwtUserStrategy(configService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('validate', () => {
    it('should return user object when payload is valid and userType is user', async () => {
      // Arrange
      const payload = {
        sub: 'user-id',
        email: 'admin@stayly.dev',
        roles: ['super_admin'],
        permissions: ['user:manage'],
        userType: 'user',
      };

      // Act
      const result = await strategy.validate(payload);

      // Assert
      expect(result).toEqual({
        id: 'user-id',
        email: 'admin@stayly.dev',
        roles: ['super_admin'],
        permissions: ['user:manage'],
        userType: 'user',
      });
    });

    it('should return user object when payload is valid without userType', async () => {
      // Arrange
      const payload = {
        sub: 'user-id',
        email: 'admin@stayly.dev',
        roles: ['super_admin'],
        permissions: ['user:manage'],
      };

      // Act
      const result = await strategy.validate(payload);

      // Assert
      expect(result).toEqual({
        id: 'user-id',
        email: 'admin@stayly.dev',
        roles: ['super_admin'],
        permissions: ['user:manage'],
        userType: 'user',
      });
    });

    it('should throw UnauthorizedException when payload missing sub', async () => {
      // Arrange
      const payload = {
        email: 'admin@stayly.dev',
        roles: ['super_admin'],
      };

      // Act & Assert
      await expect(strategy.validate(payload)).rejects.toThrow(UnauthorizedException);
      await expect(strategy.validate(payload)).rejects.toThrow('Invalid token payload');
    });

    it('should throw UnauthorizedException when payload missing email', async () => {
      // Arrange
      const payload = {
        sub: 'user-id',
        roles: ['super_admin'],
      };

      // Act & Assert
      await expect(strategy.validate(payload)).rejects.toThrow(UnauthorizedException);
      await expect(strategy.validate(payload)).rejects.toThrow('Invalid token payload');
    });

    it('should throw UnauthorizedException when userType is customer', async () => {
      // Arrange
      const payload = {
        sub: 'customer-id',
        email: 'customer@stayly.dev',
        roles: ['customer'],
        permissions: [],
        userType: 'customer',
      };

      // Act & Assert
      await expect(strategy.validate(payload)).rejects.toThrow(UnauthorizedException);
      await expect(strategy.validate(payload)).rejects.toThrow(
        'Customer tokens are not allowed for admin endpoints',
      );
    });

    it('should handle empty roles and permissions', async () => {
      // Arrange
      const payload = {
        sub: 'user-id',
        email: 'admin@stayly.dev',
        userType: 'user',
      };

      // Act
      const result = await strategy.validate(payload);

      // Assert
      expect(result).toEqual({
        id: 'user-id',
        email: 'admin@stayly.dev',
        roles: [],
        permissions: [],
        userType: 'user',
      });
    });
  });
});

