/**
 * NotificationId wraps uuid validation for notification aggregate identifiers
 */
import { BaseId } from "../../../../common/domain/value-objects/base-id.vo";

export class NotificationId extends BaseId {
  private constructor(value: string) {
    super(value);
  }

  static create(value: string): NotificationId {
    return new NotificationId(value);
  }
}
