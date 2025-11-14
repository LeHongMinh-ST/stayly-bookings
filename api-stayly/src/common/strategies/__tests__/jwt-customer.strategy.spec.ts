/**
 * Unit tests for JwtCustomerStrategy
 * Tests JWT strategy for customer authentication
 */
import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtCustomerStrategy } from '../jwt-customer.strategy';

const createConfigServiceMock = (
  secret: string | undefined,
): jest.Mocked<ConfigService> =>
  ({
    get: jest.fn((key: string) => (key === 'jwt.secret' ? secret : undefined)),
  }) as unknown as jest.Mocked<ConfigService>;

describe('JwtCustomerStrategy', () => {
  let strategy: JwtCustomerStrategy;
  let configService: jest.Mocked<ConfigService>;

  beforeEach(() => {
    // Arrange: Create mocks
    configService = createConfigServiceMock('test-secret-key');
    strategy = new JwtCustomerStrategy(configService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('validate', () => {
    it('should return customer object when payload is valid and userType is customer', () => {
      // Arrange
      const payload = {
        sub: 'customer-id',
        email: 'customer@stayly.dev',
        roles: ['customer'],
        permissions: [],
        userType: 'customer',
      };

      // Act
      const result = strategy.validate(payload);

      // Assert
      expect(result).toEqual({
        id: 'customer-id',
        email: 'customer@stayly.dev',
        roles: ['customer'],
        permissions: [],
        userType: 'customer',
      });
    });

    it('should return customer object when payload is valid without userType but has customer role', () => {
      // Arrange
      const payload = {
        sub: 'customer-id',
        email: 'customer@stayly.dev',
        roles: ['customer'],
        permissions: [],
      };

      // Act
      const result = strategy.validate(payload);

      // Assert
      expect(result).toEqual({
        id: 'customer-id',
        email: 'customer@stayly.dev',
        roles: ['customer'],
        permissions: [],
        userType: 'customer',
      });
    });

    it('should throw UnauthorizedException when payload missing sub', () => {
      // Arrange
      const payload = {
        email: 'customer@stayly.dev',
        roles: ['customer'],
      };

      // Act & Assert
      expect(() => strategy.validate(payload)).toThrow(UnauthorizedException);
      expect(() => strategy.validate(payload)).toThrow('Invalid token payload');
    });

    it('should throw UnauthorizedException when payload missing email', () => {
      // Arrange
      const payload = {
        sub: 'customer-id',
        roles: ['customer'],
      };

      // Act & Assert
      expect(() => strategy.validate(payload)).toThrow(UnauthorizedException);
      expect(() => strategy.validate(payload)).toThrow('Invalid token payload');
    });

    it('should throw UnauthorizedException when userType is user', () => {
      // Arrange
      const payload = {
        sub: 'user-id',
        email: 'admin@stayly.dev',
        roles: ['super_admin'],
        permissions: ['user:manage'],
        userType: 'user',
      };

      // Act & Assert
      expect(() => strategy.validate(payload)).toThrow(UnauthorizedException);
      expect(() => strategy.validate(payload)).toThrow(
        'Admin tokens are not allowed for customer endpoints',
      );
    });

    it('should throw UnauthorizedException when user has non-customer roles', () => {
      // Arrange
      const payload = {
        sub: 'user-id',
        email: 'admin@stayly.dev',
        roles: ['super_admin'],
        permissions: ['user:manage'],
      };

      // Act & Assert
      expect(() => strategy.validate(payload)).toThrow(UnauthorizedException);
      expect(() => strategy.validate(payload)).toThrow(
        'Admin tokens are not allowed for customer endpoints',
      );
    });

    it('should handle empty roles and permissions', () => {
      // Arrange
      const payload = {
        sub: 'customer-id',
        email: 'customer@stayly.dev',
        userType: 'customer',
      };

      // Act
      const result = strategy.validate(payload);

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
