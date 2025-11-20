/**
 * MoneyVO stores monetary amounts with basic validation
 */
import { InvalidInputError } from "../../../../common/domain/errors";

export interface MoneyProps {
  amount: number;
  currency: string;
}

export class MoneyVO {
  private constructor(
    private readonly amount: number,
    private readonly currency: string,
  ) {}

  static create(props: MoneyProps): MoneyVO {
    if (Number.isNaN(props.amount) || props.amount < 0) {
      throw new InvalidInputError("Money amount must be zero or positive");
    }

    if (!props.currency?.match(/^[A-Z]{3}$/)) {
      throw new InvalidInputError("Currency must follow ISO-4217 format");
    }

    return new MoneyVO(Number(props.amount.toFixed(2)), props.currency);
  }

  getAmount(): number {
    return this.amount;
  }

  getCurrency(): string {
    return this.currency;
  }
}
