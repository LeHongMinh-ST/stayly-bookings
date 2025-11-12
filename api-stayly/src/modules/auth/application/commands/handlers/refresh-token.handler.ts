/**
 * RefreshTokenHandler validates refresh token and rotates credentials
 */
import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { randomUUID } from 'crypto';
import { RefreshTokenCommand } from '../refresh-token.command';
import type { TokenService } from '../../../../../common/application/interfaces/token-service.interface';
import { TOKEN_SERVICE } from '../../../../../common/application/interfaces/token-service.interface';
import type { ISessionRepository } from '../../../domain/repositories/session.repository.interface';
import { SESSION_REPOSITORY } from '../../../domain/repositories/session.repository.interface';
import { TokenResponseDto } from '../../dto/token-response.dto';
import { JwtPayload } from '../../../domain/value-objects/jwt-payload.vo';
import { Session } from '../../../domain/entities/session.entity';

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
    const payload = await this.tokenService.verifyRefreshToken(command.refreshToken);
    const session = await this.loadSession(payload);

    if (!session.isActive()) {
      throw new Error('Refresh token expired or revoked');
    }

    const nextPayload = JwtPayload.create({
      ...payload.getProps(),
      tokenId: randomUUID(),
    });

    const tokenPair = await this.tokenService.issueTokenPair(nextPayload);
    session.rotateToken(tokenPair.refreshToken);
    await this.sessionRepository.save(session);

    return new TokenResponseDto(
      tokenPair.accessToken.getValue(),
      tokenPair.refreshToken.getValue(),
      'Bearer',
      tokenPair.accessToken.getExpiresInSeconds(),
    );
  }

  private async loadSession(payload: JwtPayload): Promise<Session> {
    const props = payload.getProps();
    if (!props.tokenId) {
      throw new BadRequestException('Refresh token missing token identifier');
    }
    const session = await this.sessionRepository.findActiveByTokenId(props.tokenId);
    if (!session) {
      throw new NotFoundException('Refresh session not found');
    }
    return session;
  }
}
