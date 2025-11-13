/**
 * Unit tests for JwtCustomerStrategy
 * Tests JWT strategy for customer authentication
 */
import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtCustomerStrategy } from '../jwt-customer.strategy';

describe('JwtCustomerStrategy', () => {
  let strategy: JwtCustomerStrategy;
  let configService: jest.Mocked<ConfigService>;

  beforeEach(() => {
    // Arrange: Create mocks
    configService = {
      get: jest.fn().mockReturnValue('test-secret-key'),
    } as any;

    strategy = new JwtCustomerStrategy(configService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('validate', () => {
    it('should return customer object when payload is valid and userType is customer', async () => {
      // Arrange
      const payload = {
        sub: 'customer-id',
        email: 'customer@stayly.dev',
        roles: ['customer'],
        permissions: [],
        userType: 'customer',
      };

      // Act
      const result = await strategy.validate(payload);

      // Assert
      expect(result).toEqual({
        id: 'customer-id',
        email: 'customer@stayly.dev',
        roles: ['customer'],
        permissions: [],
        userType: 'customer',
      });
    });

    it('should return customer object when payload is valid without userType but has customer role', async () => {
      // Arrange
      const payload = {
        sub: 'customer-id',
        email: 'customer@stayly.dev',
        roles: ['customer'],
        permissions: [],
      };

      // Act
      const result = await strategy.validate(payload);

      // Assert
      expect(result).toEqual({
        id: 'customer-id',
        email: 'customer@stayly.dev',
        roles: ['customer'],
        permissions: [],
        userType: 'customer',
      });
    });

    it('should throw UnauthorizedException when payload missing sub', async () => {
      // Arrange
      const payload = {
        email: 'customer@stayly.dev',
        roles: ['customer'],
      };

      // Act & Assert
      await expect(strategy.validate(payload)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(strategy.validate(payload)).rejects.toThrow(
        'Invalid token payload',
      );
    });

    it('should throw UnauthorizedException when payload missing email', async () => {
      // Arrange
      const payload = {
        sub: 'customer-id',
        roles: ['customer'],
      };

      // Act & Assert
      await expect(strategy.validate(payload)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(strategy.validate(payload)).rejects.toThrow(
        'Invalid token payload',
      );
    });

    it('should throw UnauthorizedException when userType is user', async () => {
      // Arrange
      const payload = {
        sub: 'user-id',
        email: 'admin@stayly.dev',
        roles: ['super_admin'],
        permissions: ['user:manage'],
        userType: 'user',
      };

      // Act & Assert
      await expect(strategy.validate(payload)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(strategy.validate(payload)).rejects.toThrow(
        'Admin tokens are not allowed for customer endpoints',
      );
    });

    it('should throw UnauthorizedException when user has non-customer roles', async () => {
      // Arrange
      const payload = {
        sub: 'user-id',
        email: 'admin@stayly.dev',
        roles: ['super_admin'],
        permissions: ['user:manage'],
      };

      // Act & Assert
      await expect(strategy.validate(payload)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(strategy.validate(payload)).rejects.toThrow(
        'Admin tokens are not allowed for customer endpoints',
      );
    });

    it('should handle empty roles and permissions', async () => {
      // Arrange
      const payload = {
        sub: 'customer-id',
        email: 'customer@stayly.dev',
        userType: 'customer',
      };

      // Act
      const result = await strategy.validate(payload);

      // Assert
      expect(result).toEqual({
        id: 'customer-id',
        email: 'customer@stayly.dev',
        roles: ['customer'],
        permissions: [],
        userType: 'customer',
      });
    });
  });
});
