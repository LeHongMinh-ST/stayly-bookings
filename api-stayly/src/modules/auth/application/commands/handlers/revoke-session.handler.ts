/**
 * RevokeSessionHandler revokes active refresh session
 */
import { Inject, Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { RevokeSessionCommand } from '../revoke-session.command';
import type { ISessionRepository } from '../../../domain/repositories/session.repository.interface';
import { SESSION_REPOSITORY } from '../../../domain/repositories/session.repository.interface';

@Injectable()
@CommandHandler(RevokeSessionCommand)
export class RevokeSessionHandler
  implements ICommandHandler<RevokeSessionCommand, void>
{
  constructor(
    @Inject(SESSION_REPOSITORY)
    private readonly sessionRepository: ISessionRepository,
  ) {}

  /**
   * Executes revocation marking session as revoked
   */
  async execute(command: RevokeSessionCommand): Promise<void> {
    const session = await this.sessionRepository.findActiveByTokenId(command.tokenId);
    if (!session) {
      return;
    }
    await this.sessionRepository.revokeById(session.getId(), new Date());
  }
}
