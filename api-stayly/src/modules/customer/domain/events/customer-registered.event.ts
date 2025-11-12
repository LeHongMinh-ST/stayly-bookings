/**
 * CustomerRegisteredEvent signals a newly registered guest account
 */
import { DomainEvent } from '../../../../common/domain/interfaces/domain-event.interface';

export class CustomerRegisteredEvent implements DomainEvent {
  readonly name = 'customer.registered';

  constructor(
    public readonly customerId: string,
    public readonly email: string,
    public readonly occurredAt: Date,
  ) {}
}
