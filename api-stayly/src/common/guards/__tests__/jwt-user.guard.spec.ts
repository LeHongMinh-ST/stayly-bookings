/**
 * Unit tests for JwtUserGuard
 * Tests user (admin/staff) authentication guard
 */
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtUserGuard } from '../jwt-user.guard';
import { IS_PUBLIC_KEY } from '../../decorators/public.decorator';

describe('JwtUserGuard', () => {
  let guard: JwtUserGuard;
  let reflector: jest.Mocked<Reflector>;
  let context: jest.Mocked<ExecutionContext>;

  const mockUser = {
    id: 'user-id',
    email: 'admin@stayly.dev',
    roles: ['super_admin'],
    permissions: ['user:manage'],
    userType: 'user',
  };

  const mockCustomer = {
    id: 'customer-id',
    email: 'customer@stayly.dev',
    roles: ['customer'],
    permissions: [],
    userType: 'customer',
  };

  beforeEach(() => {
    // Arrange: Create mocks
    reflector = {
      getAllAndOverride: jest.fn(),
    } as any;

    context = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({
          user: mockUser,
        }),
      }),
    } as any;

    guard = new JwtUserGuard(reflector);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('canActivate', () => {
    it('should allow access when route is marked as public', () => {
      // Arrange
      reflector.getAllAndOverride.mockReturnValue(true);

      // Act
      const result = guard.canActivate(context);

      // Assert
      expect(result).toBe(true);
      expect(reflector.getAllAndOverride).toHaveBeenCalledWith(IS_PUBLIC_KEY, [
        context.getHandler(),
        context.getClass(),
      ]);
    });

    it('should call parent canActivate when route is not public', () => {
      // Arrange
      reflector.getAllAndOverride.mockReturnValue(false);
      const parentCanActivate = jest.spyOn(Object.getPrototypeOf(JwtUserGuard.prototype), 'canActivate');
      parentCanActivate.mockReturnValue(true);

      // Act
      const result = guard.canActivate(context);

      // Assert
      expect(result).toBe(true);
      expect(reflector.getAllAndOverride).toHaveBeenCalledWith(IS_PUBLIC_KEY, [
        context.getHandler(),
        context.getClass(),
      ]);
      parentCanActivate.mockRestore();
    });
  });

  describe('handleRequest', () => {
    it('should return user when authentication succeeds', () => {
      // Arrange
      const err = null;
      const user = mockUser;
      const info = null;

      // Act
      const result = guard.handleRequest(err, user, info);

      // Assert
      expect(result).toBe(mockUser);
    });

    it('should throw error when error occurs', () => {
      // Arrange
      const err = new Error('Token expired');
      const user = null;
      const info = null;

      // Act & Assert
      expect(() => guard.handleRequest(err, user, info)).toThrow(Error);
      expect(() => guard.handleRequest(err, user, info)).toThrow('Token expired');
    });

    it('should throw UnauthorizedException when user is null', () => {
      // Arrange
      const err = null;
      const user = null;
      const info = null;

      // Act & Assert
      expect(() => guard.handleRequest(err, user, info)).toThrow(UnauthorizedException);
      expect(() => guard.handleRequest(err, user, info)).toThrow('Invalid or expired token');
    });

    it('should throw UnauthorizedException when user is a customer', () => {
      // Arrange
      const err = null;
      const user = mockCustomer;
      const info = null;

      // Act & Assert
      expect(() => guard.handleRequest(err, user, info)).toThrow(UnauthorizedException);
      expect(() => guard.handleRequest(err, user, info)).toThrow(
        'Customer tokens are not allowed for admin endpoints',
      );
    });

    it('should allow user without userType if roles are not customer', () => {
      // Arrange
      const userWithoutType = {
        id: 'user-id',
        email: 'admin@stayly.dev',
        roles: ['super_admin'],
        permissions: ['user:manage'],
      };
      const err = null;
      const info = null;

      // Act
      const result = guard.handleRequest(err, userWithoutType, info);

      // Assert
      expect(result).toBe(userWithoutType);
    });
  });
});

