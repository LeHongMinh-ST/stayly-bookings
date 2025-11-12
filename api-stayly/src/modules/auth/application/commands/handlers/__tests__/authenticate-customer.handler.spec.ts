/**
 * Unit tests for AuthenticateCustomerHandler
 * Tests customer authentication flow
 */
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthenticateCustomerHandler } from '../authenticate-customer.handler';
import { AuthenticateCustomerCommand } from '../../authenticate-customer.command';
import type { ICustomerAuthenticationService } from '../../../interfaces/customer-authentication.service.interface';
import { CUSTOMER_AUTHENTICATION_SERVICE } from '../../../interfaces/customer-authentication.service.interface';
import type { PasswordHasher } from '../../../../../../common/application/interfaces/password-hasher.interface';
import { PASSWORD_HASHER } from '../../../../../../common/application/interfaces/password-hasher.interface';
import type { TokenService } from '../../../../../../common/application/interfaces/token-service.interface';
import { TOKEN_SERVICE } from '../../../../../../common/application/interfaces/token-service.interface';
import type { ISessionRepository } from '../../../../domain/repositories/session.repository.interface';
import { SESSION_REPOSITORY } from '../../../../domain/repositories/session.repository.interface';
import { Email } from '../../../../../../common/domain/value-objects/email.vo';
import { JwtPayload } from '../../../../domain/value-objects/jwt-payload.vo';
import { AccessToken } from '../../../../domain/value-objects/access-token.vo';
import { RefreshToken } from '../../../../domain/value-objects/refresh-token.vo';
import { TokenPair } from '../../../../domain/value-objects/token-pair.vo';
import { randomUUID } from 'crypto';

describe('AuthenticateCustomerHandler', () => {
  let handler: AuthenticateCustomerHandler;
  let customerAuthService: jest.Mocked<ICustomerAuthenticationService>;
  let passwordHasher: jest.Mocked<PasswordHasher>;
  let tokenService: jest.Mocked<TokenService>;
  let sessionRepository: jest.Mocked<ISessionRepository>;

  const customerId = randomUUID();
  const customerEmail = Email.create('customer@stayly.dev');
  const password = 'CustomerPassword123!';
  const hashedPassword = '$2b$10$hashedpassword';
  const userAgent = 'Mozilla/5.0';
  const ipAddress = '192.168.1.1';

  const mockCustomerData = {
    id: customerId,
    email: 'customer@stayly.dev',
    passwordHash: hashedPassword,
    isActive: true,
  };

  beforeEach(async () => {
    // Arrange: Create mocks
    const mockCustomerAuthRepository = {
      findForAuthentication: jest.fn(),
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
        AuthenticateCustomerHandler,
        {
          provide: CUSTOMER_AUTHENTICATION_SERVICE,
          useValue: mockCustomerAuthRepository,
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

    handler = module.get<AuthenticateCustomerHandler>(AuthenticateCustomerHandler);
    customerAuthService = module.get(CUSTOMER_AUTHENTICATION_SERVICE);
    passwordHasher = module.get(PASSWORD_HASHER);
    tokenService = module.get(TOKEN_SERVICE);
    sessionRepository = module.get(SESSION_REPOSITORY);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should authenticate customer successfully and return token pair', async () => {
      // Arrange
      const command = new AuthenticateCustomerCommand(
        customerEmail.getValue(),
        password,
        userAgent,
        ipAddress,
      );

      const accessToken = AccessToken.create('access-token-long-enough', 3600);
      const expiresAt = new Date(Date.now() + 604800 * 1000);
      const refreshToken = RefreshToken.create('refresh-token-long-enough-to-pass-validation', expiresAt, randomUUID());
      const tokenPair = new TokenPair(accessToken, refreshToken);

      customerAuthService.findForAuthentication.mockResolvedValue(mockCustomerData);
      passwordHasher.compare.mockResolvedValue(true);
      tokenService.issueTokenPair.mockResolvedValue(tokenPair);
      sessionRepository.save.mockResolvedValue();

      // Act
      const result = await handler.execute(command);

      // Assert
      expect(result).toBeDefined();
      expect(result.accessToken).toBe('access-token-long-enough');
      expect(result.refreshToken).toBe('refresh-token-long-enough-to-pass-validation');
      expect(result.tokenType).toBe('Bearer');
      expect(customerAuthService.findForAuthentication).toHaveBeenCalledWith(customerEmail);
      expect(passwordHasher.compare).toHaveBeenCalledWith(password, hashedPassword);
      expect(tokenService.issueTokenPair).toHaveBeenCalled();
      expect(sessionRepository.save).toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when customer not found', async () => {
      // Arrange
      const command = new AuthenticateCustomerCommand(
        customerEmail.getValue(),
        password,
        userAgent,
        ipAddress,
      );

      customerAuthService.findForAuthentication.mockResolvedValue(null);

      // Act & Assert
      await expect(handler.execute(command)).rejects.toThrow(UnauthorizedException);
      await expect(handler.execute(command)).rejects.toThrow('Invalid credentials');
      expect(customerAuthService.findForAuthentication).toHaveBeenCalledWith(customerEmail);
      expect(passwordHasher.compare).not.toHaveBeenCalled();
      expect(tokenService.issueTokenPair).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when password does not match', async () => {
      // Arrange
      const command = new AuthenticateCustomerCommand(
        customerEmail.getValue(),
        'WrongPassword',
        userAgent,
        ipAddress,
      );

      customerAuthService.findForAuthentication.mockResolvedValue(mockCustomerData);
      passwordHasher.compare.mockResolvedValue(false);

      // Act & Assert
      await expect(handler.execute(command)).rejects.toThrow(UnauthorizedException);
      await expect(handler.execute(command)).rejects.toThrow('Invalid credentials');
      expect(customerAuthService.findForAuthentication).toHaveBeenCalledWith(customerEmail);
      expect(passwordHasher.compare).toHaveBeenCalledWith('WrongPassword', hashedPassword);
      expect(tokenService.issueTokenPair).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when customer is not active', async () => {
      // Arrange
      const inactiveCustomerData = {
        ...mockCustomerData,
        isActive: false,
      };

      const command = new AuthenticateCustomerCommand(
        customerEmail.getValue(),
        password,
        userAgent,
        ipAddress,
      );

      customerAuthService.findForAuthentication.mockResolvedValue(inactiveCustomerData);
      passwordHasher.compare.mockResolvedValue(true);

      // Act & Assert
      await expect(handler.execute(command)).rejects.toThrow(BadRequestException);
      await expect(handler.execute(command)).rejects.toThrow('Customer account is not active');
      expect(customerAuthService.findForAuthentication).toHaveBeenCalledWith(customerEmail);
      expect(passwordHasher.compare).toHaveBeenCalledWith(password, hashedPassword);
      expect(tokenService.issueTokenPair).not.toHaveBeenCalled();
    });

    it('should create JWT payload with userType as customer', async () => {
      // Arrange
      const command = new AuthenticateCustomerCommand(
        customerEmail.getValue(),
        password,
        userAgent,
        ipAddress,
      );

      const accessToken = AccessToken.create('access-token-long-enough', 3600);
      const expiresAt = new Date(Date.now() + 604800 * 1000);
      const refreshToken = RefreshToken.create('refresh-token-long-enough-to-pass-validation', expiresAt, randomUUID());
      const tokenPair = new TokenPair(accessToken, refreshToken);

      customerAuthService.findForAuthentication.mockResolvedValue(mockCustomerData);
      passwordHasher.compare.mockResolvedValue(true);
      tokenService.issueTokenPair.mockResolvedValue(tokenPair);
      sessionRepository.save.mockResolvedValue();

      // Act
      await handler.execute(command);

      // Assert
      expect(tokenService.issueTokenPair).toHaveBeenCalled();
      const payload = tokenService.issueTokenPair.mock.calls[0][0] as JwtPayload;
      const payloadProps = payload.getProps();
      expect(payloadProps.userType).toBe('customer');
      expect(payloadProps.sub).toBe(customerId);
      expect(payloadProps.email).toBe(customerEmail.getValue());
      expect(payloadProps.roles).toEqual(['customer']);
      expect(payloadProps.permissions).toEqual([]);
    });

    it('should create session with correct metadata', async () => {
      // Arrange
      const command = new AuthenticateCustomerCommand(
        customerEmail.getValue(),
        password,
        userAgent,
        ipAddress,
      );

      const accessToken = AccessToken.create('access-token-long-enough', 3600);
      const expiresAt = new Date(Date.now() + 604800 * 1000);
      const refreshToken = RefreshToken.create('refresh-token-long-enough-to-pass-validation', expiresAt, randomUUID());
      const tokenPair = new TokenPair(accessToken, refreshToken);

      customerAuthService.findForAuthentication.mockResolvedValue(mockCustomerData);
      passwordHasher.compare.mockResolvedValue(true);
      tokenService.issueTokenPair.mockResolvedValue(tokenPair);
      sessionRepository.save.mockResolvedValue();

      // Act
      await handler.execute(command);

      // Assert
      expect(sessionRepository.save).toHaveBeenCalled();
      const savedSession = sessionRepository.save.mock.calls[0][0];
      expect(savedSession.getUserId()).toBe(customerId);
      expect(savedSession.getUserAgent()).toBe(userAgent);
      expect(savedSession.getIpAddress()).toBe(ipAddress);
    });
  });
});

