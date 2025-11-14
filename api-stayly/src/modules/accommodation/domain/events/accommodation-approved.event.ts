/**
 * AccommodationApprovedEvent
 * Domain event raised when accommodation is approved
 */

import { DomainEvent } from "../../../../common/domain/interfaces/domain-event.interface";
import { AccommodationId } from "../value-objects/accommodation-id.vo";

export class AccommodationApprovedEvent implements DomainEvent {
  readonly name = "accommodation.approved";

  constructor(
    public readonly accommodationId: AccommodationId,
    public readonly approvedBy: string,
    public readonly occurredAt: Date = new Date(),
  ) {}

  getAggregateId(): string {
    return this.accommodationId.getValue();
  }
}
