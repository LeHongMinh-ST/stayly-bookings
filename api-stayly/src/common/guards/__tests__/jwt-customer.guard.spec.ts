/**
 * Unit tests for JwtCustomerGuard
 * Tests customer authentication guard
 */
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtCustomerGuard } from '../jwt-customer.guard';
import { IS_PUBLIC_KEY } from '../../decorators/public.decorator';

describe('JwtCustomerGuard', () => {
  let guard: JwtCustomerGuard;
  let reflector: jest.Mocked<Reflector>;
  let context: jest.Mocked<ExecutionContext>;

  const mockCustomer = {
    id: 'customer-id',
    email: 'customer@stayly.dev',
    roles: ['customer'],
    permissions: [],
    userType: 'customer',
  };

  const mockUser = {
    id: 'user-id',
    email: 'admin@stayly.dev',
    roles: ['super_admin'],
    permissions: ['user:manage'],
    userType: 'user',
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
          user: mockCustomer,
        }),
      }),
    } as any;

    guard = new JwtCustomerGuard(reflector);
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
      const parentCanActivate = jest.spyOn(Object.getPrototypeOf(JwtCustomerGuard.prototype), 'canActivate');
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
    it('should return customer when authentication succeeds', () => {
      // Arrange
      const err = null;
      const user = mockCustomer;
      const info = null;

      // Act
      const result = guard.handleRequest(err, user, info);

      // Assert
      expect(result).toBe(mockCustomer);
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

    it('should throw UnauthorizedException when user is admin/staff', () => {
      // Arrange
      const err = null;
      const user = mockUser;
      const info = null;

      // Act & Assert
      expect(() => guard.handleRequest(err, user, info)).toThrow(UnauthorizedException);
      expect(() => guard.handleRequest(err, user, info)).toThrow(
        'Admin tokens are not allowed for customer endpoints',
      );
    });

    it('should allow user with customer role even without userType', () => {
      // Arrange
      const customerWithoutType = {
        id: 'customer-id',
        email: 'customer@stayly.dev',
        roles: ['customer'],
        permissions: [],
      };
      const err = null;
      const info = null;

      // Act
      const result = guard.handleRequest(err, customerWithoutType, info);

      // Assert
      expect(result).toBe(customerWithoutType);
    });

    it('should throw UnauthorizedException when user has only admin roles', () => {
      // Arrange
      const userWithOnlyAdminRole = {
        id: 'user-id',
        email: 'admin@stayly.dev',
        roles: ['super_admin'],
        permissions: [],
        userType: 'user',
      };
      const err = null;
      const info = null;

      // Act & Assert
      expect(() => guard.handleRequest(err, userWithOnlyAdminRole, info)).toThrow(UnauthorizedException);
      expect(() => guard.handleRequest(err, userWithOnlyAdminRole, info)).toThrow(
        'Admin tokens are not allowed for customer endpoints',
      );
    });
  });
});

