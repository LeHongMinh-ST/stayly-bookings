/**
 * Unit tests for RevokeSessionHandler
 * Tests session revocation flow
 */
import { Test, TestingModule } from "@nestjs/testing";
import { RevokeSessionHandler } from "../revoke-session.handler";
import { RevokeSessionCommand } from "../../revoke-session.command";
import type { ISessionRepository } from "../../../../domain/repositories/session.repository.interface";
import { SESSION_REPOSITORY } from "../../../../domain/repositories/session.repository.interface";
import { Session } from "../../../../domain/entities/session.entity";
import { SessionId } from "../../../../domain/value-objects/session-id.vo";
import { RefreshToken } from "../../../../domain/value-objects/refresh-token.vo";
import { randomUUID } from "crypto";

describe("RevokeSessionHandler", () => {
  let handler: RevokeSessionHandler;
  let findActiveByTokenIdMock: jest.Mock;
  let revokeByIdMock: jest.Mock;
  let saveSessionMock: jest.Mock;

  const tokenId = randomUUID();
  const userId = randomUUID();
  const sessionId = randomUUID();
  const expiresAt = new Date(Date.now() + 604800 * 1000);
  const refreshToken = RefreshToken.create(
    "refresh-token-value-long-enough-to-pass-validation",
    expiresAt,
    randomUUID(),
  );

  const mockSession = Session.create({
    id: SessionId.create(sessionId),
    userId: userId,
    userType: "user",
    refreshToken: refreshToken,
    userAgent: "Mozilla/5.0",
    ipAddress: "192.168.1.1",
  });

  beforeEach(async () => {
    // Arrange: Create mocks
    findActiveByTokenIdMock = jest.fn();
    revokeByIdMock = jest.fn();
    saveSessionMock = jest.fn();

    const mockSessionRepository: ISessionRepository = {
      save: saveSessionMock,
      findActiveByTokenId: findActiveByTokenIdMock,
      revokeById: revokeByIdMock,
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
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("execute", () => {
    it("should revoke session successfully", async () => {
      // Arrange
      const command = new RevokeSessionCommand(tokenId);

      findActiveByTokenIdMock.mockResolvedValue(mockSession);
      revokeByIdMock.mockResolvedValue(undefined);

      // Act
      await handler.execute(command);

      // Assert
      expect(findActiveByTokenIdMock).toHaveBeenCalledWith(tokenId);
      expect(revokeByIdMock).toHaveBeenCalledWith(sessionId, expect.any(Date));
    });

    it("should do nothing when session not found", async () => {
      // Arrange
      const command = new RevokeSessionCommand(tokenId);

      findActiveByTokenIdMock.mockResolvedValue(null);

      // Act
      await handler.execute(command);

      // Assert
      expect(findActiveByTokenIdMock).toHaveBeenCalledWith(tokenId);
      expect(revokeByIdMock).not.toHaveBeenCalled();
    });

    it("should revoke session with current date", async () => {
      // Arrange
      const command = new RevokeSessionCommand(tokenId);
      const beforeRevoke = new Date();

      findActiveByTokenIdMock.mockResolvedValue(mockSession);
      revokeByIdMock.mockResolvedValue(undefined);

      // Act
      await handler.execute(command);

      // Assert
      expect(revokeByIdMock).toHaveBeenCalled();
      const [, revokeDate] = revokeByIdMock.mock.calls[0] as [string, Date];
      expect(revokeDate).toBeInstanceOf(Date);
      expect(revokeDate.getTime()).toBeGreaterThanOrEqual(
        beforeRevoke.getTime(),
      );
    });
  });
});
