/**
 * UserCreatedEvent notifies listeners when a new administrative user is created
 */
import { DomainEvent } from '../../../../common/domain/interfaces/domain-event.interface';

export class UserCreatedEvent implements DomainEvent {
  readonly name = 'user.created';

  constructor(
    public readonly userId: string,
    public readonly occurredAt: Date,
  ) {}
}
