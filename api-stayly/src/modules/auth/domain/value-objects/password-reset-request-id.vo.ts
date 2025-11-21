/**
 * PasswordResetRequestId extends BaseId to encapsulate UUID validation
 */
import { BaseId } from "../../../../common/domain/value-objects/base-id.vo";

export class PasswordResetRequestId extends BaseId {
  private constructor(value: string) {
    super(value);
  }

  static create(value: string): PasswordResetRequestId {
    return new PasswordResetRequestId(value);
  }
}
