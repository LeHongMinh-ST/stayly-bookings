/**
 * Unit tests for JwtUserStrategy
 * Tests JWT strategy for user (admin/staff) authentication
 */
import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtUserStrategy } from '../jwt-user.strategy';

const createConfigServiceMock = (
  secret: string | undefined,
): jest.Mocked<ConfigService> =>
  ({
    get: jest.fn((key: string) => (key === 'jwt.secret' ? secret : undefined)),
  }) as unknown as jest.Mocked<ConfigService>;

type JwtUserPayload = Parameters<JwtUserStrategy['validate']>[0];

describe('JwtUserStrategy', () => {
  let strategy: JwtUserStrategy;
  let configService: jest.Mocked<ConfigService>;

  beforeEach(() => {
    // Arrange: Create mocks
    configService = createConfigServiceMock('test-secret-key');
    strategy = new JwtUserStrategy(configService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('validate', () => {
    it('should return user object when payload is valid and userType is user', () => {
      const payload: JwtUserPayload = {
        sub: 'user-id',
        email: 'admin@stayly.dev',
        roles: ['super_admin'],
        permissions: ['user:manage'],
        userType: 'user',
      };

      const result = strategy.validate(payload);

      expect(result).toEqual({
        id: 'user-id',
        email: 'admin@stayly.dev',
        roles: ['super_admin'],
        permissions: ['user:manage'],
        userType: 'user',
      });
    });

    it('should return user object when payload is valid without userType', () => {
      const payload: JwtUserPayload = {
        sub: 'user-id',
        email: 'admin@stayly.dev',
        roles: ['super_admin'],
        permissions: ['user:manage'],
      };

      const result = strategy.validate(payload);

      expect(result).toEqual({
        id: 'user-id',
        email: 'admin@stayly.dev',
        roles: ['super_admin'],
        permissions: ['user:manage'],
        userType: 'user',
      });
    });

    it('should throw UnauthorizedException when payload missing sub', () => {
      const payload = {
        email: 'admin@stayly.dev',
        roles: ['super_admin'],
      };

      expect(() => strategy.validate(payload as JwtUserPayload)).toThrow(
        UnauthorizedException,
      );
      expect(() => strategy.validate(payload as JwtUserPayload)).toThrow(
        'Invalid token payload',
      );
    });

    it('should throw UnauthorizedException when payload missing email', () => {
      const payload = {
        sub: 'user-id',
        roles: ['super_admin'],
      };

      expect(() => strategy.validate(payload as JwtUserPayload)).toThrow(
        UnauthorizedException,
      );
      expect(() => strategy.validate(payload as JwtUserPayload)).toThrow(
        'Invalid token payload',
      );
    });

    it('should throw UnauthorizedException when userType is customer', () => {
      const payload: JwtUserPayload = {
        sub: 'customer-id',
        email: 'customer@stayly.dev',
        roles: ['customer'],
        permissions: [],
        userType: 'customer',
      };

      expect(() => strategy.validate(payload)).toThrow(UnauthorizedException);
      expect(() => strategy.validate(payload)).toThrow(
        'Customer tokens are not allowed for admin endpoints',
      );
    });

    it('should handle empty roles and permissions', () => {
      const payload: JwtUserPayload = {
        sub: 'user-id',
        email: 'admin@stayly.dev',
        userType: 'user',
      };

      const result = strategy.validate(payload);

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
