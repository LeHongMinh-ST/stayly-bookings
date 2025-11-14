/**
 * AccommodationId Value Object
 * Represents unique identifier for Accommodation aggregate
 */

import { BaseId } from "../../../../common/domain/value-objects/base-id.vo";

export class AccommodationId extends BaseId {
  static create(value: string): AccommodationId {
    return new AccommodationId(value);
  }
}
