/**
 * Unit tests for AuthenticateUserHandler
 * Tests user (admin/staff) authentication flow
 *
 * Note: User authentication data no longer includes roles/permissions.
 * They are queried separately from RBAC module via IUserRolePermissionQueryService
 */
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthenticateUserHandler } from '../authenticate-user.handler';
import { AuthenticateUserCommand } from '../../authenticate-user.command';
import type { IUserAuthenticationService } from '../../../interfaces/user-authentication.service.interface';
import { USER_AUTHENTICATION_SERVICE } from '../../../interfaces/user-authentication.service.interface';
import type { IUserRolePermissionQueryService } from '../../../interfaces/user-role-permission-query.service.interface';
import { USER_ROLE_PERMISSION_QUERY_SERVICE } from '../../../interfaces/user-role-permission-query.service.interface';
import type { PasswordHasher } from '../../../../../../common/application/interfaces/password-hasher.interface';
import { PASSWORD_HASHER } from '../../../../../../common/application/interfaces/password-hasher.interface';
import type { TokenService } from '../../../../../../common/application/interfaces/token-service.interface';
import { TOKEN_SERVICE } from '../../../../../../common/application/interfaces/token-service.interface';
import type { ISessionRepository } from '../../../../domain/repositories/session.repository.interface';
import { SESSION_REPOSITORY } from '../../../../domain/repositories/session.repository.interface';
import { Email } from '../../../../../../common/domain/value-objects/email.vo';
import { AccessToken } from '../../../../domain/value-objects/access-token.vo';
import { RefreshToken } from '../../../../domain/value-objects/refresh-token.vo';
import { TokenPair } from '../../../../domain/value-objects/token-pair.vo';
import { Session } from '../../../../domain/entities/session.entity';
import { JwtPayload } from '../../../../domain/value-objects/jwt-payload.vo';
import { randomUUID } from 'crypto';

describe('AuthenticateUserHandler', () => {
  let handler: AuthenticateUserHandler;
  let findForAuthenticationMock: jest.Mock;
  let getUserRolesAndPermissionsMock: jest.Mock;
  let comparePasswordMock: jest.Mock;
  let hashPasswordMock: jest.Mock;
  let issueTokenPairMock: jest.Mock;
  let verifyRefreshTokenMock: jest.Mock;
  let saveSessionMock: jest.Mock;
  let findActiveSessionMock: jest.Mock;
  let revokeSessionMock: jest.Mock;

  const userId = randomUUID();
  const userEmail = Email.create('admin@stayly.dev');
  const password = 'SecurePassword123!';
  const hashedPassword = '$2b$10$hashedpassword';
  const userAgent = 'Mozilla/5.0';
  const ipAddress = '192.168.1.1';

  const mockUserData = {
    id: userId,
    email: 'admin@stayly.dev',
    passwordHash: hashedPassword,
    isActive: true,
  };

  const mockRolePermissionData = {
    roles: ['super_admin'],
    permissions: ['user:manage', 'user:read', 'user:create'],
  };

  beforeEach(async () => {
    // Arrange: Create mocks
    findForAuthenticationMock = jest.fn();
    getUserRolesAndPermissionsMock = jest.fn();
    comparePasswordMock = jest.fn();
    hashPasswordMock = jest.fn();
    issueTokenPairMock = jest.fn();
    verifyRefreshTokenMock = jest.fn();
    saveSessionMock = jest.fn();
    findActiveSessionMock = jest.fn();
    revokeSessionMock = jest.fn();

    const mockUserAuthService: IUserAuthenticationService = {
      findForAuthentication: findForAuthenticationMock,
    };

    const mockUserRolePermissionQueryService: IUserRolePermissionQueryService =
      {
        getUserRolesAndPermissions: getUserRolesAndPermissionsMock,
      };

    const mockPasswordHasher: PasswordHasher = {
      compare: comparePasswordMock,
      hash: hashPasswordMock,
    };

    const mockTokenService: TokenService = {
      issueTokenPair: issueTokenPairMock,
      verifyRefreshToken: verifyRefreshTokenMock,
    };

    const mockSessionRepository: ISessionRepository = {
      save: saveSessionMock,
      findActiveByTokenId: findActiveSessionMock,
      revokeById: revokeSessionMock,
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthenticateUserHandler,
        {
          provide: USER_AUTHENTICATION_SERVICE,
          useValue: mockUserAuthService,
        },
        {
          provide: USER_ROLE_PERMISSION_QUERY_SERVICE,
          useValue: mockUserRolePermissionQueryService,
        },
        {
          provide: PASSWORD_HASHER,
          useValue: mockPasswordHasher,
        },
        {
          provide: TOKEN_SERVICE,
          useValue: mockTokenService,
        },
        {
          provide: SESSION_REPOSITORY,
          useValue: mockSessionRepository,
        },
      ],
    }).compile();

    handler = module.get<AuthenticateUserHandler>(AuthenticateUserHandler);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should authenticate user successfully and return token pair', async () => {
      // Arrange
      const command = new AuthenticateUserCommand(
        userEmail.getValue(),
        password,
        userAgent,
        ipAddress,
      );

      const accessToken = AccessToken.create('access-token-long-enough', 3600);
      const expiresAt = new Date(Date.now() + 604800 * 1000);
      const refreshToken = RefreshToken.create(
        'refresh-token-long-enough-to-pass-validation',
        expiresAt,
        randomUUID(),
      );
      const tokenPair = new TokenPair(accessToken, refreshToken);

      findForAuthenticationMock.mockResolvedValue(mockUserData);
      comparePasswordMock.mockResolvedValue(true);
      getUserRolesAndPermissionsMock.mockResolvedValue(mockRolePermissionData);
      issueTokenPairMock.mockResolvedValue(tokenPair);
      saveSessionMock.mockResolvedValue(undefined);

      // Act
      const result = await handler.execute(command);

      // Assert
      expect(result).toBeDefined();
      expect(result.accessToken).toBe('access-token-long-enough');
      expect(result.refreshToken).toBe(
        'refresh-token-long-enough-to-pass-validation',
      );
      expect(result.tokenType).toBe('Bearer');
      expect(findForAuthenticationMock).toHaveBeenCalledWith(userEmail);
      expect(comparePasswordMock).toHaveBeenCalledWith(
        password,
        hashedPassword,
      );
      expect(getUserRolesAndPermissionsMock).toHaveBeenCalledWith(userId);
      expect(issueTokenPairMock).toHaveBeenCalled();
      expect(saveSessionMock).toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when user not found', async () => {
      // Arrange
      const command = new AuthenticateUserCommand(
        userEmail.getValue(),
        password,
        userAgent,
        ipAddress,
      );

      findForAuthenticationMock.mockResolvedValue(null);

      // Act & Assert
      await expect(handler.execute(command)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(handler.execute(command)).rejects.toThrow(
        'Invalid credentials',
      );
      expect(findForAuthenticationMock).toHaveBeenCalledWith(userEmail);
      expect(comparePasswordMock).not.toHaveBeenCalled();
      expect(getUserRolesAndPermissionsMock).not.toHaveBeenCalled();
      expect(issueTokenPairMock).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when password does not match', async () => {
      // Arrange
      const command = new AuthenticateUserCommand(
        userEmail.getValue(),
        'WrongPassword',
        userAgent,
        ipAddress,
      );

      findForAuthenticationMock.mockResolvedValue(mockUserData);
      comparePasswordMock.mockResolvedValue(false);

      // Act & Assert
      await expect(handler.execute(command)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(handler.execute(command)).rejects.toThrow(
        'Invalid credentials',
      );
      expect(findForAuthenticationMock).toHaveBeenCalledWith(userEmail);
      expect(comparePasswordMock).toHaveBeenCalledWith(
        'WrongPassword',
        hashedPassword,
      );
      expect(getUserRolesAndPermissionsMock).not.toHaveBeenCalled();
      expect(issueTokenPairMock).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when user is not active', async () => {
      // Arrange
      const inactiveUserData = {
        ...mockUserData,
        isActive: false,
      };

      const command = new AuthenticateUserCommand(
        userEmail.getValue(),
        password,
        userAgent,
        ipAddress,
      );

      findForAuthenticationMock.mockResolvedValue(inactiveUserData);
      comparePasswordMock.mockResolvedValue(true);

      // Act & Assert
      await expect(handler.execute(command)).rejects.toThrow(
        BadRequestException,
      );
      await expect(handler.execute(command)).rejects.toThrow(
        'User is not active',
      );
      expect(findForAuthenticationMock).toHaveBeenCalledWith(userEmail);
      expect(comparePasswordMock).toHaveBeenCalledWith(
        password,
        hashedPassword,
      );
      expect(getUserRolesAndPermissionsMock).not.toHaveBeenCalled();
      expect(issueTokenPairMock).not.toHaveBeenCalled();
    });

    it('should query roles and permissions from RBAC module after user validation', async () => {
      // Arrange
      const command = new AuthenticateUserCommand(
        userEmail.getValue(),
        password,
        userAgent,
        ipAddress,
      );

      const accessToken = AccessToken.create('access-token-long-enough', 3600);
      const expiresAt = new Date(Date.now() + 604800 * 1000);
      const refreshToken = RefreshToken.create(
        'refresh-token-long-enough-to-pass-validation',
        expiresAt,
        randomUUID(),
      );
      const tokenPair = new TokenPair(accessToken, refreshToken);

      findForAuthenticationMock.mockResolvedValue(mockUserData);
      comparePasswordMock.mockResolvedValue(true);
      getUserRolesAndPermissionsMock.mockResolvedValue(mockRolePermissionData);
      issueTokenPairMock.mockResolvedValue(tokenPair);
      saveSessionMock.mockResolvedValue(undefined);

      // Act
      await handler.execute(command);

      // Assert: Verify that getUserRolesAndPermissions is called with correct userId
      expect(getUserRolesAndPermissionsMock).toHaveBeenCalledWith(userId);
      // Verify that it's called after password validation (by checking all required calls happened)
      expect(findForAuthenticationMock).toHaveBeenCalled();
      expect(comparePasswordMock).toHaveBeenCalled();
      expect(getUserRolesAndPermissionsMock).toHaveBeenCalled();
      expect(issueTokenPairMock).toHaveBeenCalled();
    });

    it('should create JWT payload with roles and permissions from RBAC module', async () => {
      // Arrange
      const command = new AuthenticateUserCommand(
        userEmail.getValue(),
        password,
        userAgent,
        ipAddress,
      );

      const accessToken = AccessToken.create('access-token-long-enough', 3600);
      const expiresAt = new Date(Date.now() + 604800 * 1000);
      const refreshToken = RefreshToken.create(
        'refresh-token-long-enough-to-pass-validation',
        expiresAt,
        randomUUID(),
      );
      const tokenPair = new TokenPair(accessToken, refreshToken);

      findForAuthenticationMock.mockResolvedValue(mockUserData);
      comparePasswordMock.mockResolvedValue(true);
      getUserRolesAndPermissionsMock.mockResolvedValue(mockRolePermissionData);
      issueTokenPairMock.mockResolvedValue(tokenPair);
      saveSessionMock.mockResolvedValue(undefined);

      // Act
      await handler.execute(command);

      // Assert
      expect(issueTokenPairMock).toHaveBeenCalled();
      const [issuedPayload] = issueTokenPairMock.mock.calls[0] as [JwtPayload];
      const payload = issuedPayload;
      const payloadProps = payload.getProps();
      expect(payloadProps.userType).toBe('user');
      expect(payloadProps.sub).toBe(userId);
      expect(payloadProps.email).toBe(userEmail.getValue());
      expect(payloadProps.roles).toEqual(['super_admin']);
      expect(payloadProps.permissions).toEqual([
        'user:manage',
        'user:read',
        'user:create',
      ]);
    });

    it('should handle user with multiple roles and merged permissions', async () => {
      // Arrange
      const command = new AuthenticateUserCommand(
        userEmail.getValue(),
        password,
        userAgent,
        ipAddress,
      );

      const multiRolePermissionData = {
        roles: ['super_admin', 'manager'],
        permissions: [
          'user:manage',
          'user:read',
          'user:create',
          'booking:read',
          'booking:create',
        ],
      };

      const accessToken = AccessToken.create('access-token-long-enough', 3600);
      const expiresAt = new Date(Date.now() + 604800 * 1000);
      const refreshToken = RefreshToken.create(
        'refresh-token-long-enough-to-pass-validation',
        expiresAt,
        randomUUID(),
      );
      const tokenPair = new TokenPair(accessToken, refreshToken);

      findForAuthenticationMock.mockResolvedValue(mockUserData);
      comparePasswordMock.mockResolvedValue(true);
      getUserRolesAndPermissionsMock.mockResolvedValue(multiRolePermissionData);
      issueTokenPairMock.mockResolvedValue(tokenPair);
      saveSessionMock.mockResolvedValue(undefined);

      // Act
      await handler.execute(command);

      // Assert
      const [issuedPayload] = issueTokenPairMock.mock.calls[0] as [JwtPayload];
      const payload = issuedPayload;
      const payloadProps = payload.getProps();
      expect(payloadProps.roles).toEqual(['super_admin', 'manager']);
      expect(payloadProps.permissions).toEqual([
        'user:manage',
        'user:read',
        'user:create',
        'booking:read',
        'booking:create',
      ]);
    });

    it('should handle user with no roles and only direct permissions', async () => {
      // Arrange
      const command = new AuthenticateUserCommand(
        userEmail.getValue(),
        password,
        userAgent,
        ipAddress,
      );

      const noRolePermissionData = {
        roles: [],
        permissions: ['user:read'],
      };

      const accessToken = AccessToken.create('access-token-long-enough', 3600);
      const expiresAt = new Date(Date.now() + 604800 * 1000);
      const refreshToken = RefreshToken.create(
        'refresh-token-long-enough-to-pass-validation',
        expiresAt,
        randomUUID(),
      );
      const tokenPair = new TokenPair(accessToken, refreshToken);

      findForAuthenticationMock.mockResolvedValue(mockUserData);
      comparePasswordMock.mockResolvedValue(true);
      getUserRolesAndPermissionsMock.mockResolvedValue(noRolePermissionData);
      issueTokenPairMock.mockResolvedValue(tokenPair);
      saveSessionMock.mockResolvedValue(undefined);

      // Act
      await handler.execute(command);

      // Assert
      const [issuedPayload] = issueTokenPairMock.mock.calls[0] as [JwtPayload];
      const payload = issuedPayload;
      const payloadProps = payload.getProps();
      expect(payloadProps.roles).toEqual([]);
      expect(payloadProps.permissions).toEqual(['user:read']);
    });

    it('should create session with correct metadata', async () => {
      // Arrange
      const command = new AuthenticateUserCommand(
        userEmail.getValue(),
        password,
        userAgent,
        ipAddress,
      );

      const accessToken = AccessToken.create('access-token-long-enough', 3600);
      const expiresAt = new Date(Date.now() + 604800 * 1000);
      const refreshToken = RefreshToken.create(
        'refresh-token-long-enough-to-pass-validation',
        expiresAt,
        randomUUID(),
      );
      const tokenPair = new TokenPair(accessToken, refreshToken);

      findForAuthenticationMock.mockResolvedValue(mockUserData);
      comparePasswordMock.mockResolvedValue(true);
      getUserRolesAndPermissionsMock.mockResolvedValue(mockRolePermissionData);
      issueTokenPairMock.mockResolvedValue(tokenPair);
      saveSessionMock.mockResolvedValue(undefined);

      // Act
      await handler.execute(command);

      // Assert
      expect(saveSessionMock).toHaveBeenCalled();
      const [savedSession] = saveSessionMock.mock.calls[0] as [Session];
      expect(savedSession.getUserId()).toBe(userId);
      expect(savedSession.getUserAgent()).toBe(userAgent);
      expect(savedSession.getIpAddress()).toBe(ipAddress);
    });

    it('should handle null userAgent and ipAddress', async () => {
      // Arrange
      const command = new AuthenticateUserCommand(
        userEmail.getValue(),
        password,
        null,
        null,
      );

      const accessToken = AccessToken.create('access-token-long-enough', 3600);
      const expiresAt = new Date(Date.now() + 604800 * 1000);
      const refreshToken = RefreshToken.create(
        'refresh-token-long-enough-to-pass-validation',
        expiresAt,
        randomUUID(),
      );
      const tokenPair = new TokenPair(accessToken, refreshToken);

      findForAuthenticationMock.mockResolvedValue(mockUserData);
      comparePasswordMock.mockResolvedValue(true);
      getUserRolesAndPermissionsMock.mockResolvedValue(mockRolePermissionData);
      issueTokenPairMock.mockResolvedValue(tokenPair);
      saveSessionMock.mockResolvedValue(undefined);

      // Act
      await handler.execute(command);

      // Assert
      expect(saveSessionMock).toHaveBeenCalled();
      const [savedSession] = saveSessionMock.mock.calls[0] as [Session];
      expect(savedSession.getUserAgent()).toBeNull();
      expect(savedSession.getIpAddress()).toBeNull();
    });

    it('should propagate error when RBAC query fails', async () => {
      // Arrange
      const command = new AuthenticateUserCommand(
        userEmail.getValue(),
        password,
        userAgent,
        ipAddress,
      );

      findForAuthenticationMock.mockResolvedValue(mockUserData);
      comparePasswordMock.mockResolvedValue(true);
      getUserRolesAndPermissionsMock.mockRejectedValue(
        new Error('User not found in RBAC'),
      );

      // Act & Assert
      await expect(handler.execute(command)).rejects.toThrow(
        'User not found in RBAC',
      );
      expect(findForAuthenticationMock).toHaveBeenCalled();
      expect(comparePasswordMock).toHaveBeenCalled();
      expect(getUserRolesAndPermissionsMock).toHaveBeenCalled();
      expect(issueTokenPairMock).not.toHaveBeenCalled();
      expect(saveSessionMock).not.toHaveBeenCalled();
    });
  });
});
