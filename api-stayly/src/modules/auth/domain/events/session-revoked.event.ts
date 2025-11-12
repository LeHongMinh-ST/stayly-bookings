/**
 * SessionRevokedEvent indicates that a refresh session is no longer valid
 */
import { DomainEvent } from '../../../../common/domain/interfaces/domain-event.interface';

export class SessionRevokedEvent implements DomainEvent {
  readonly name = 'auth.session.revoked';

  constructor(
    public readonly sessionId: string,
    public readonly userId: string,
    public readonly occurredAt: Date,
  ) {}
}
