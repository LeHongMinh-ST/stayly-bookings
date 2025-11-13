/**
 * RoleId value object extends BaseId for shared UUID validation
 */
import { BaseId } from '../../../../common/domain/value-objects/base-id.vo';

export class RoleId extends BaseId {
  private constructor(value: string) {
    super(value);
  }

  static create(value: string): RoleId {
    return new RoleId(value);
  }
}

