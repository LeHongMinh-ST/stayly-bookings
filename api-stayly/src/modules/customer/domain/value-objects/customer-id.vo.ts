/**
 * CustomerId value object extends BaseId for consistent UUID validation
 */
import { BaseId } from "../../../../common/domain/value-objects/base-id.vo";

export class CustomerId extends BaseId {
  private constructor(value: string) {
    super(value);
  }

  static create(value: string): CustomerId {
    return new CustomerId(value);
  }
}
