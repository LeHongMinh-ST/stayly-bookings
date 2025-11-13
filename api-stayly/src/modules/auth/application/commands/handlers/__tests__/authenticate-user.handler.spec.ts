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
import { randomUUID } from 'crypto';

describe('AuthenticateUserHandler', () => {
  let handler: AuthenticateUserHandler;
  let userAuthService: jest.Mocked<IUserAuthenticationService>;
  let userRolePermissionQueryService: jest.Mocked<IUserRolePermissionQueryService>;
  let passwordHasher: jest.Mocked<PasswordHasher>;
  let tokenService: jest.Mocked<TokenService>;
  let sessionRepository: jest.Mocked<ISessionRepository>;

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
    const mockUserAuthService = {
      findForAuthentication: jest.fn(),
    };

    const mockUserRolePermissionQueryService = {
      getUserRolesAndPermissions: jest.fn(),
    };

    const mockPasswordHasher = {
      compare: jest.fn(),
      hash: jest.fn(),
    };

    const mockTokenService = {
      issueTokenPair: jest.fn(),
      verifyRefreshToken: jest.fn(),
    };

    const mockSessionRepository = {
      save: jest.fn(),
      findActiveByTokenId: jest.fn(),
      revokeById: jest.fn(),
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
    userAuthService = module.get(USER_AUTHENTICATION_SERVICE);
    userRolePermissionQueryService = module.get(USER_ROLE_PERMISSION_QUERY_SERVICE);
    passwordHasher = module.get(PASSWORD_HASHER);
    tokenService = module.get(TOKEN_SERVICE);
    sessionRepository = module.get(SESSION_REPOSITORY);
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

      userAuthService.findForAuthentication.mockResolvedValue(mockUserData);
      passwordHasher.compare.mockResolvedValue(true);
      userRolePermissionQueryService.getUserRolesAndPermissions.mockResolvedValue(
        mockRolePermissionData,
      );
      tokenService.issueTokenPair.mockResolvedValue(tokenPair);
      sessionRepository.save.mockResolvedValue();

      // Act
      const result = await handler.execute(command);

      // Assert
      expect(result).toBeDefined();
      expect(result.accessToken).toBe('access-token-long-enough');
      expect(result.refreshToken).toBe(
        'refresh-token-long-enough-to-pass-validation',
      );
      expect(result.tokenType).toBe('Bearer');
      expect(userAuthService.findForAuthentication).toHaveBeenCalledWith(
        userEmail,
      );
      expect(passwordHasher.compare).toHaveBeenCalledWith(
        password,
        hashedPassword,
      );
      expect(
        userRolePermissionQueryService.getUserRolesAndPermissions,
      ).toHaveBeenCalledWith(userId);
      expect(tokenService.issueTokenPair).toHaveBeenCalled();
      expect(sessionRepository.save).toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when user not found', async () => {
      // Arrange
      const command = new AuthenticateUserCommand(
        userEmail.getValue(),
        password,
        userAgent,
        ipAddress,
      );

      userAuthService.findForAuthentication.mockResolvedValue(null);

      // Act & Assert
      await expect(handler.execute(command)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(handler.execute(command)).rejects.toThrow(
        'Invalid credentials',
      );
      expect(userAuthService.findForAuthentication).toHaveBeenCalledWith(
        userEmail,
      );
      expect(passwordHasher.compare).not.toHaveBeenCalled();
      expect(
        userRolePermissionQueryService.getUserRolesAndPermissions,
      ).not.toHaveBeenCalled();
      expect(tokenService.issueTokenPair).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when password does not match', async () => {
      // Arrange
      const command = new AuthenticateUserCommand(
        userEmail.getValue(),
        'WrongPassword',
        userAgent,
        ipAddress,
      );

      userAuthService.findForAuthentication.mockResolvedValue(mockUserData);
      passwordHasher.compare.mockResolvedValue(false);

      // Act & Assert
      await expect(handler.execute(command)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(handler.execute(command)).rejects.toThrow(
        'Invalid credentials',
      );
      expect(userAuthService.findForAuthentication).toHaveBeenCalledWith(
        userEmail,
      );
      expect(passwordHasher.compare).toHaveBeenCalledWith(
        'WrongPassword',
        hashedPassword,
      );
      expect(
        userRolePermissionQueryService.getUserRolesAndPermissions,
      ).not.toHaveBeenCalled();
      expect(tokenService.issueTokenPair).not.toHaveBeenCalled();
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

      userAuthService.findForAuthentication.mockResolvedValue(inactiveUserData);
      passwordHasher.compare.mockResolvedValue(true);

      // Act & Assert
      await expect(handler.execute(command)).rejects.toThrow(
        BadRequestException,
      );
      await expect(handler.execute(command)).rejects.toThrow(
        'User is not active',
      );
      expect(userAuthService.findForAuthentication).toHaveBeenCalledWith(
        userEmail,
      );
      expect(passwordHasher.compare).toHaveBeenCalledWith(
        password,
        hashedPassword,
      );
      expect(
        userRolePermissionQueryService.getUserRolesAndPermissions,
      ).not.toHaveBeenCalled();
      expect(tokenService.issueTokenPair).not.toHaveBeenCalled();
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

      userAuthService.findForAuthentication.mockResolvedValue(mockUserData);
      passwordHasher.compare.mockResolvedValue(true);
      userRolePermissionQueryService.getUserRolesAndPermissions.mockResolvedValue(
        mockRolePermissionData,
      );
      tokenService.issueTokenPair.mockResolvedValue(tokenPair);
      sessionRepository.save.mockResolvedValue();

      // Act
      await handler.execute(command);

      // Assert: Verify that getUserRolesAndPermissions is called with correct userId
      expect(
        userRolePermissionQueryService.getUserRolesAndPermissions,
      ).toHaveBeenCalledWith(userId);
      // Verify that it's called after password validation (by checking all required calls happened)
      expect(userAuthService.findForAuthentication).toHaveBeenCalled();
      expect(passwordHasher.compare).toHaveBeenCalled();
      expect(
        userRolePermissionQueryService.getUserRolesAndPermissions,
      ).toHaveBeenCalled();
      expect(tokenService.issueTokenPair).toHaveBeenCalled();
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

      userAuthService.findForAuthentication.mockResolvedValue(mockUserData);
      passwordHasher.compare.mockResolvedValue(true);
      userRolePermissionQueryService.getUserRolesAndPermissions.mockResolvedValue(
        mockRolePermissionData,
      );
      tokenService.issueTokenPair.mockResolvedValue(tokenPair);
      sessionRepository.save.mockResolvedValue();

      // Act
      await handler.execute(command);

      // Assert
      expect(tokenService.issueTokenPair).toHaveBeenCalled();
      const payload = tokenService.issueTokenPair.mock.calls[0][0];
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

      userAuthService.findForAuthentication.mockResolvedValue(mockUserData);
      passwordHasher.compare.mockResolvedValue(true);
      userRolePermissionQueryService.getUserRolesAndPermissions.mockResolvedValue(
        multiRolePermissionData,
      );
      tokenService.issueTokenPair.mockResolvedValue(tokenPair);
      sessionRepository.save.mockResolvedValue();

      // Act
      await handler.execute(command);

      // Assert
      const payload = tokenService.issueTokenPair.mock.calls[0][0];
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

      userAuthService.findForAuthentication.mockResolvedValue(mockUserData);
      passwordHasher.compare.mockResolvedValue(true);
      userRolePermissionQueryService.getUserRolesAndPermissions.mockResolvedValue(
        noRolePermissionData,
      );
      tokenService.issueTokenPair.mockResolvedValue(tokenPair);
      sessionRepository.save.mockResolvedValue();

      // Act
      await handler.execute(command);

      // Assert
      const payload = tokenService.issueTokenPair.mock.calls[0][0];
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

      userAuthService.findForAuthentication.mockResolvedValue(mockUserData);
      passwordHasher.compare.mockResolvedValue(true);
      userRolePermissionQueryService.getUserRolesAndPermissions.mockResolvedValue(
        mockRolePermissionData,
      );
      tokenService.issueTokenPair.mockResolvedValue(tokenPair);
      sessionRepository.save.mockResolvedValue();

      // Act
      await handler.execute(command);

      // Assert
      expect(sessionRepository.save).toHaveBeenCalled();
      const savedSession = sessionRepository.save.mock.calls[0][0];
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

      userAuthService.findForAuthentication.mockResolvedValue(mockUserData);
      passwordHasher.compare.mockResolvedValue(true);
      userRolePermissionQueryService.getUserRolesAndPermissions.mockResolvedValue(
        mockRolePermissionData,
      );
      tokenService.issueTokenPair.mockResolvedValue(tokenPair);
      sessionRepository.save.mockResolvedValue();

      // Act
      await handler.execute(command);

      // Assert
      expect(sessionRepository.save).toHaveBeenCalled();
      const savedSession = sessionRepository.save.mock.calls[0][0];
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

      userAuthService.findForAuthentication.mockResolvedValue(mockUserData);
      passwordHasher.compare.mockResolvedValue(true);
      userRolePermissionQueryService.getUserRolesAndPermissions.mockRejectedValue(
        new Error('User not found in RBAC'),
      );

      // Act & Assert
      await expect(handler.execute(command)).rejects.toThrow('User not found in RBAC');
      expect(userAuthService.findForAuthentication).toHaveBeenCalled();
      expect(passwordHasher.compare).toHaveBeenCalled();
      expect(
        userRolePermissionQueryService.getUserRolesAndPermissions,
      ).toHaveBeenCalled();
      expect(tokenService.issueTokenPair).not.toHaveBeenCalled();
      expect(sessionRepository.save).not.toHaveBeenCalled();
    });
  });
});
