/**
 * Policies Value Object
 * Represents general policies for accommodation
 */

export class Policies {
  private constructor(
    private readonly checkInTime: string,
    private readonly checkOutTime: string,
    private readonly childrenAllowed: boolean,
    private readonly petsAllowed: boolean,
    private readonly smokingAllowed: boolean,
  ) {}

  static create(props: {
    checkInTime: string;
    checkOutTime: string;
    childrenAllowed: boolean;
    petsAllowed: boolean;
    smokingAllowed: boolean;
  }): Policies {
    return new Policies(
      props.checkInTime,
      props.checkOutTime,
      props.childrenAllowed,
      props.petsAllowed,
      props.smokingAllowed,
    );
  }

  getCheckInTime(): string {
    return this.checkInTime;
  }

  getCheckOutTime(): string {
    return this.checkOutTime;
  }

  isChildrenAllowed(): boolean {
    return this.childrenAllowed;
  }

  isPetsAllowed(): boolean {
    return this.petsAllowed;
  }

  isSmokingAllowed(): boolean {
    return this.smokingAllowed;
  }
}
