/**
 * RefreshTokenHandler validates refresh token and rotates credentials
 */
import { Inject, Injectable } from "@nestjs/common";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { randomUUID } from "crypto";
import { RefreshTokenCommand } from "../refresh-token.command";
import type { TokenService } from "../../../../../common/application/interfaces/token-service.interface";
import { TOKEN_SERVICE } from "../../../../../common/application/interfaces/token-service.interface";
import type { ISessionRepository } from "../../../domain/repositories/session.repository.interface";
import { SESSION_REPOSITORY } from "../../../domain/repositories/session.repository.interface";
import { TokenResponseDto } from "../../dto/response/token-response.dto";
import { JwtPayload } from "../../../domain/value-objects/jwt-payload.vo";
import { Session } from "../../../domain/entities/session.entity";
import {
  ensureEntityExists,
  throwInvalidInput,
  throwInvalidOperation,
} from "../../../../../common/application/exceptions";

@Injectable()
@CommandHandler(RefreshTokenCommand)
export class RefreshTokenHandler
  implements ICommandHandler<RefreshTokenCommand, TokenResponseDto>
{
  constructor(
    @Inject(TOKEN_SERVICE)
    private readonly tokenService: TokenService,
    @Inject(SESSION_REPOSITORY)
    private readonly sessionRepository: ISessionRepository,
  ) {}

  /**
   * Executes refresh flow ensuring session validity
   */
  async execute(command: RefreshTokenCommand): Promise<TokenResponseDto> {
    const payload = await this.tokenService.verifyRefreshToken(
      command.refreshToken,
    );
    const session = await this.loadSession(payload);

    if (!session.isActive()) {
      throwInvalidOperation(
        "Refresh token expired or revoked",
        "refresh_token",
        "Session is not active",
      );
    }

    const props = payload.getProps();
    const nextPayload = JwtPayload.create({
      ...props,
      tokenId: randomUUID(),
      // Preserve userType from original token
      userType: props.userType,
    });

    const tokenPair = await this.tokenService.issueTokenPair(nextPayload);
    session.rotateToken(tokenPair.refreshToken);
    await this.sessionRepository.save(session);

    return new TokenResponseDto(
      tokenPair.accessToken.getValue(),
      tokenPair.refreshToken.getValue(),
      "Bearer",
      tokenPair.accessToken.getExpiresInSeconds(),
    );
  }

  private async loadSession(payload: JwtPayload): Promise<Session> {
    const props = payload.getProps();
    if (!props.tokenId) {
      throwInvalidInput("Refresh token missing token identifier", "tokenId");
    }
    const session = ensureEntityExists(
      await this.sessionRepository.findActiveByTokenId(props.tokenId),
      "Session",
      props.tokenId,
    );
    return session;
  }
}
