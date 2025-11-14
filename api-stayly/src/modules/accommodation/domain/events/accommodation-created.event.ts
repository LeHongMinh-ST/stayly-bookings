/**
 * AccommodationCreatedEvent
 * Domain event raised when accommodation is created
 */

import { DomainEvent } from "../../../../common/domain/interfaces/domain-event.interface";
import { AccommodationId } from "../value-objects/accommodation-id.vo";

export class AccommodationCreatedEvent implements DomainEvent {
  readonly name = "accommodation.created";

  constructor(
    public readonly accommodationId: AccommodationId,
    public readonly ownerId: string,
    public readonly type: string,
    public readonly occurredAt: Date = new Date(),
  ) {}

  getAggregateId(): string {
    return this.accommodationId.getValue();
  }
}
