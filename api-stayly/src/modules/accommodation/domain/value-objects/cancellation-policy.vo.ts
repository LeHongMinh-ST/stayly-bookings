/**
 * CancellationPolicy Value Object
 * Represents cancellation policy for accommodation
 */

import { InvalidInputError } from "../../../../common/domain/errors";

export enum CancellationPolicyType {
  FLEXIBLE = "flexible",
  MODERATE = "moderate",
  STRICT = "strict",
  NON_REFUNDABLE = "non_refundable",
}

export class CancellationPolicy {
  private constructor(
    private readonly type: CancellationPolicyType,
    private readonly freeCancellationDays: number,
    private readonly refundPercentage: number,
  ) {
    if (freeCancellationDays < 0) {
      throw new InvalidInputError(
        "Free cancellation days must be non-negative",
      );
    }
    if (refundPercentage < 0 || refundPercentage > 100) {
      throw new InvalidInputError(
        "Refund percentage must be between 0 and 100",
      );
    }
  }

  static create(props: {
    type: CancellationPolicyType;
    freeCancellationDays: number;
    refundPercentage: number;
  }): CancellationPolicy {
    return new CancellationPolicy(
      props.type,
      props.freeCancellationDays,
      props.refundPercentage,
    );
  }

  getType(): CancellationPolicyType {
    return this.type;
  }

  getFreeCancellationDays(): number {
    return this.freeCancellationDays;
  }

  getRefundPercentage(): number {
    return this.refundPercentage;
  }

  isFlexible(): boolean {
    return this.type === CancellationPolicyType.FLEXIBLE;
  }

  isNonRefundable(): boolean {
    return this.type === CancellationPolicyType.NON_REFUNDABLE;
  }
}
