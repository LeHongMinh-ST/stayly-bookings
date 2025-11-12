/**
 * Unit tests for RefreshTokenHandler
 * Tests token refresh flow
 */
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { RefreshTokenHandler } from '../refresh-token.handler';
import { RefreshTokenCommand } from '../../refresh-token.command';
import type { TokenService } from '../../../../../../common/application/interfaces/token-service.interface';
import { TOKEN_SERVICE } from '../../../../../../common/application/interfaces/token-service.interface';
import type { ISessionRepository } from '../../../../domain/repositories/session.repository.interface';
import { SESSION_REPOSITORY } from '../../../../domain/repositories/session.repository.interface';
import { TokenResponseDto } from '../../../dto/token-response.dto';
import { JwtPayload } from '../../../../domain/value-objects/jwt-payload.vo';
import { AccessToken } from '../../../../domain/value-objects/access-token.vo';
import { RefreshToken } from '../../../../domain/value-objects/refresh-token.vo';
import { TokenPair } from '../../../../domain/value-objects/token-pair.vo';
import { Session } from '../../../../domain/entities/session.entity';
import { randomUUID } from 'crypto';

describe('RefreshTokenHandler', () => {
  let handler: RefreshTokenHandler;
  let tokenService: jest.Mocked<TokenService>;
  let sessionRepository: jest.Mocked<ISessionRepository>;

  const tokenId = randomUUID();
  const userId = randomUUID();
  const refreshTokenValue = 'refresh-token-value-long-enough-to-pass-validation';
  const userAgent = 'Mozilla/5.0';
  const ipAddress = '192.168.1.1';

  const mockPayload = JwtPayload.create({
    sub: userId,
    email: 'user@stayly.dev',
    roles: ['super_admin'],
    permissions: ['user:manage'],
    tokenId: tokenId,
    userType: 'user',
  });

  const expiresAt = new Date(Date.now() + 604800 * 1000);
  const mockRefreshToken = RefreshToken.create(refreshTokenValue, expiresAt, tokenId);
  const mockSession = Session.create({
    id: randomUUID(),
    userId: userId,
    refreshToken: mockRefreshToken,
    userAgent: userAgent,
    ipAddress: ipAddress,
  });

  beforeEach(async () => {
    // Arrange: Create mocks
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
        RefreshTokenHandler,
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

    handler = module.get<RefreshTokenHandler>(RefreshTokenHandler);
    tokenService = module.get(TOKEN_SERVICE);
    sessionRepository = module.get(SESSION_REPOSITORY);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should refresh token successfully and return new token pair', async () => {
      // Arrange
      const command = new RefreshTokenCommand(refreshTokenValue, userAgent, ipAddress);

      const newAccessToken = AccessToken.create('new-access-token-long-enough', 3600);
      const newExpiresAt = new Date(Date.now() + 604800 * 1000);
      const newTokenId = randomUUID();
      const newRefreshToken = RefreshToken.create('new-refresh-token-long-enough-to-pass', newExpiresAt, newTokenId);
      const newTokenPair = new TokenPair(newAccessToken, newRefreshToken);

      tokenService.verifyRefreshToken.mockResolvedValue(mockPayload);
      sessionRepository.findActiveByTokenId.mockResolvedValue(mockSession);
      tokenService.issueTokenPair.mockResolvedValue(newTokenPair);
      sessionRepository.save.mockResolvedValue();

      // Act
      const result = await handler.execute(command);

      // Assert
      expect(result).toBeDefined();
      expect(result.accessToken).toBe('new-access-token-long-enough');
      expect(result.refreshToken).toBe('new-refresh-token-long-enough-to-pass');
      expect(result.tokenType).toBe('Bearer');
      expect(tokenService.verifyRefreshToken).toHaveBeenCalledWith(refreshTokenValue);
      expect(sessionRepository.findActiveByTokenId).toHaveBeenCalledWith(tokenId);
      expect(tokenService.issueTokenPair).toHaveBeenCalled();
      expect(sessionRepository.save).toHaveBeenCalled();
    });

    it('should preserve userType in new token payload', async () => {
      // Arrange
      const command = new RefreshTokenCommand(refreshTokenValue, userAgent, ipAddress);

      const newAccessToken = AccessToken.create('new-access-token-long-enough', 3600);
      const newExpiresAt = new Date(Date.now() + 604800 * 1000);
      const newTokenId = randomUUID();
      const newRefreshToken = RefreshToken.create('new-refresh-token-long-enough-to-pass', newExpiresAt, newTokenId);
      const newTokenPair = new TokenPair(newAccessToken, newRefreshToken);

      tokenService.verifyRefreshToken.mockResolvedValue(mockPayload);
      sessionRepository.findActiveByTokenId.mockResolvedValue(mockSession);
      tokenService.issueTokenPair.mockResolvedValue(newTokenPair);
      sessionRepository.save.mockResolvedValue();

      // Act
      await handler.execute(command);

      // Assert
      expect(tokenService.issueTokenPair).toHaveBeenCalled();
      const newPayload = tokenService.issueTokenPair.mock.calls[0][0] as JwtPayload;
      const newPayloadProps = newPayload.getProps();
      expect(newPayloadProps.userType).toBe('user');
      expect(newPayloadProps.sub).toBe(userId);
      expect(newPayloadProps.email).toBe('user@stayly.dev');
    });

    it('should rotate refresh token in session', async () => {
      // Arrange
      const command = new RefreshTokenCommand(refreshTokenValue, userAgent, ipAddress);

      const newAccessToken = AccessToken.create('new-access-token-long-enough', 3600);
      const newExpiresAt = new Date(Date.now() + 604800 * 1000);
      const newTokenId = randomUUID();
      const newRefreshToken = RefreshToken.create('new-refresh-token-long-enough-to-pass', newExpiresAt, newTokenId);
      const newTokenPair = new TokenPair(newAccessToken, newRefreshToken);

      tokenService.verifyRefreshToken.mockResolvedValue(mockPayload);
      sessionRepository.findActiveByTokenId.mockResolvedValue(mockSession);
      tokenService.issueTokenPair.mockResolvedValue(newTokenPair);
      sessionRepository.save.mockResolvedValue();

      const oldRefreshToken = mockSession.getRefreshToken();

      // Act
      await handler.execute(command);

      // Assert
      expect(mockSession.getRefreshToken()).not.toBe(oldRefreshToken);
      expect(mockSession.getRefreshToken().getValue()).toBe('new-refresh-token-long-enough-to-pass');
      expect(sessionRepository.save).toHaveBeenCalledWith(mockSession);
    });

    it('should throw BadRequestException when refresh token missing tokenId', async () => {
      // Arrange
      const payloadWithoutTokenId = JwtPayload.create({
        sub: userId,
        email: 'user@stayly.dev',
        roles: ['super_admin'],
        permissions: [],
      });

      const command = new RefreshTokenCommand(refreshTokenValue, userAgent, ipAddress);

      tokenService.verifyRefreshToken.mockResolvedValue(payloadWithoutTokenId);

      // Act & Assert
      await expect(handler.execute(command)).rejects.toThrow(BadRequestException);
      await expect(handler.execute(command)).rejects.toThrow('Refresh token missing token identifier');
      expect(sessionRepository.findActiveByTokenId).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when session not found', async () => {
      // Arrange
      const command = new RefreshTokenCommand(refreshTokenValue, userAgent, ipAddress);

      tokenService.verifyRefreshToken.mockResolvedValue(mockPayload);
      sessionRepository.findActiveByTokenId.mockResolvedValue(null);

      // Act & Assert
      await expect(handler.execute(command)).rejects.toThrow(NotFoundException);
      await expect(handler.execute(command)).rejects.toThrow('Refresh session not found');
      expect(sessionRepository.findActiveByTokenId).toHaveBeenCalledWith(tokenId);
      expect(tokenService.issueTokenPair).not.toHaveBeenCalled();
    });

    it('should throw Error when session is not active', async () => {
      // Arrange
      const command = new RefreshTokenCommand(refreshTokenValue, userAgent, ipAddress);

      const revokedSession = Session.rehydrate({
        id: randomUUID(),
        userId: userId,
        refreshToken: mockRefreshToken,
        userAgent: userAgent,
        ipAddress: ipAddress,
        createdAt: new Date(),
        revokedAt: new Date(),
      });

      tokenService.verifyRefreshToken.mockResolvedValue(mockPayload);
      sessionRepository.findActiveByTokenId.mockResolvedValue(revokedSession);

      // Act & Assert
      await expect(handler.execute(command)).rejects.toThrow('Refresh token expired or revoked');
      expect(tokenService.issueTokenPair).not.toHaveBeenCalled();
    });

    it('should generate new tokenId for new token pair', async () => {
      // Arrange
      const command = new RefreshTokenCommand(refreshTokenValue, userAgent, ipAddress);

      const newAccessToken = AccessToken.create('new-access-token-long-enough', 3600);
      const newExpiresAt = new Date(Date.now() + 604800 * 1000);
      const newTokenId = randomUUID();
      const newRefreshToken = RefreshToken.create('new-refresh-token-long-enough-to-pass', newExpiresAt, newTokenId);
      const newTokenPair = new TokenPair(newAccessToken, newRefreshToken);

      tokenService.verifyRefreshToken.mockResolvedValue(mockPayload);
      sessionRepository.findActiveByTokenId.mockResolvedValue(mockSession);
      tokenService.issueTokenPair.mockResolvedValue(newTokenPair);
      sessionRepository.save.mockResolvedValue();

      // Act
      await handler.execute(command);

      // Assert
      expect(tokenService.issueTokenPair).toHaveBeenCalled();
      const newPayload = tokenService.issueTokenPair.mock.calls[0][0] as JwtPayload;
      const newPayloadProps = newPayload.getProps();
      expect(newPayloadProps.tokenId).toBeDefined();
      expect(newPayloadProps.tokenId).not.toBe(tokenId); // New tokenId should be different
    });
  });
});

