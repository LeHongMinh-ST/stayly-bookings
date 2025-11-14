import { InvalidInputError } from '../errors';

/**
 * BaseId value object encapsulates UUID validation for aggregate identifiers
 * Domain specific IDs should extend this class for consistent behaviour
 */
export abstract class BaseId {
  private readonly value: string;

  protected constructor(value: string) {
    BaseId.ensureValidUuid(value);
    this.value = value;
  }

  /**
   * Checks equality between two identifiers
   */
  equals(other: BaseId): boolean {
    return this.value === other.value;
  }

  /**
   * Returns identifier as primitive string
   */
  getValue(): string {
    return this.value;
  }

  toString(): string {
    return this.value;
  }

  /**
   * Validates UUID format (RFC 4122 compliant)
   */
  private static ensureValidUuid(value: string): void {
    const uuidRegex =
      /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/;
    if (!uuidRegex.test(value)) {
      throw new InvalidInputError('Identifier must be a valid UUID', 'id');
    }
  }
}
