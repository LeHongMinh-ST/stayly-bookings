/**
 * SessionId value object extends BaseId to validate session identifiers
 */
import { BaseId } from "../../../../common/domain/value-objects/base-id.vo";

export class SessionId extends BaseId {
  private constructor(value: string) {
    super(value);
  }

  static create(value: string): SessionId {
    return new SessionId(value);
  }
}
