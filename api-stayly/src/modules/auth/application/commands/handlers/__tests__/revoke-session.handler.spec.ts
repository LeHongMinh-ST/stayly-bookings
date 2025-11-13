/**
 * Unit tests for RevokeSessionHandler
 * Tests session revocation flow
 */
import { Test, TestingModule } from '@nestjs/testing';
import { RevokeSessionHandler } from '../revoke-session.handler';
import { RevokeSessionCommand } from '../../revoke-session.command';
import type { ISessionRepository } from '../../../../domain/repositories/session.repository.interface';
import { SESSION_REPOSITORY } from '../../../../domain/repositories/session.repository.interface';
import { Session } from '../../../../domain/entities/session.entity';
import { RefreshToken } from '../../../../domain/value-objects/refresh-token.vo';
import { randomUUID } from 'crypto';

describe('RevokeSessionHandler', () => {
  let handler: RevokeSessionHandler;
  let sessionRepository: jest.Mocked<ISessionRepository>;

  const tokenId = randomUUID();
  const userId = randomUUID();
  const sessionId = randomUUID();
  const expiresAt = new Date(Date.now() + 604800 * 1000);
  const refreshToken = RefreshToken.create(
    'refresh-token-value-long-enough-to-pass-validation',
    expiresAt,
    randomUUID(),
  );

  const mockSession = Session.create({
    id: sessionId,
    userId: userId,
    refreshToken: refreshToken,
    userAgent: 'Mozilla/5.0',
    ipAddress: '192.168.1.1',
  });

  beforeEach(async () => {
    // Arrange: Create mocks
    const mockSessionRepository = {
      save: jest.fn(),
      findActiveByTokenId: jest.fn(),
      revokeById: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RevokeSessionHandler,
        {
          provide: SESSION_REPOSITORY,
          useValue: mockSessionRepository,
        },
      ],
    }).compile();

    handler = module.get<RevokeSessionHandler>(RevokeSessionHandler);
    sessionRepository = module.get(SESSION_REPOSITORY);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should revoke session successfully', async () => {
      // Arrange
      const command = new RevokeSessionCommand(tokenId);
      const revokeDate = new Date();

      sessionRepository.findActiveByTokenId.mockResolvedValue(mockSession);
      sessionRepository.revokeById.mockResolvedValue();

      // Act
      await handler.execute(command);

      // Assert
      expect(sessionRepository.findActiveByTokenId).toHaveBeenCalledWith(
        tokenId,
      );
      expect(sessionRepository.revokeById).toHaveBeenCalledWith(
        sessionId,
        expect.any(Date),
      );
    });

    it('should do nothing when session not found', async () => {
      // Arrange
      const command = new RevokeSessionCommand(tokenId);

      sessionRepository.findActiveByTokenId.mockResolvedValue(null);

      // Act
      await handler.execute(command);

      // Assert
      expect(sessionRepository.findActiveByTokenId).toHaveBeenCalledWith(
        tokenId,
      );
      expect(sessionRepository.revokeById).not.toHaveBeenCalled();
    });

    it('should revoke session with current date', async () => {
      // Arrange
      const command = new RevokeSessionCommand(tokenId);
      const beforeRevoke = new Date();

      sessionRepository.findActiveByTokenId.mockResolvedValue(mockSession);
      sessionRepository.revokeById.mockResolvedValue();

      // Act
      await handler.execute(command);

      // Assert
      expect(sessionRepository.revokeById).toHaveBeenCalled();
      const revokeDate = sessionRepository.revokeById.mock.calls[0][1];
      expect(revokeDate).toBeInstanceOf(Date);
      expect(revokeDate.getTime()).toBeGreaterThanOrEqual(
        beforeRevoke.getTime(),
      );
    });
  });
});
