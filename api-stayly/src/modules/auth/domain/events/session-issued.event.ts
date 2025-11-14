/**
 * SessionIssuedEvent signals that a refresh session has been created
 */
import { DomainEvent } from "../../../../common/domain/interfaces/domain-event.interface";

export class SessionIssuedEvent implements DomainEvent {
  readonly name = "auth.session.issued";

  constructor(
    public readonly sessionId: string,
    public readonly userId: string,
    public readonly occurredAt: Date,
  ) {}
}
