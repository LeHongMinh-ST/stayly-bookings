/**
 * UserId value object extends BaseId for consistent UUID validation
 */
import { BaseId } from '../../../../common/domain/value-objects/base-id.vo';

export class UserId extends BaseId {
  private constructor(value: string) {
    super(value);
  }

  static create(value: string): UserId {
    return new UserId(value);
  }
}
