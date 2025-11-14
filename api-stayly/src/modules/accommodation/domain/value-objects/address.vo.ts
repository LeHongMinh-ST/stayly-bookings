/**
 * Address Value Object
 * Represents detailed address information
 */

export class Address {
  private constructor(
    private readonly street: string,
    private readonly ward: string,
    private readonly district: string,
    private readonly province: string,
    private readonly country: string,
  ) {}

  static create(props: {
    street: string;
    ward: string;
    district: string;
    province: string;
    country: string;
  }): Address {
    if (
      !props.street ||
      !props.ward ||
      !props.district ||
      !props.province ||
      !props.country
    ) {
      throw new Error("All address fields are required");
    }

    return new Address(
      props.street,
      props.ward,
      props.district,
      props.province,
      props.country,
    );
  }

  getStreet(): string {
    return this.street;
  }

  getWard(): string {
    return this.ward;
  }

  getDistrict(): string {
    return this.district;
  }

  getProvince(): string {
    return this.province;
  }

  getCountry(): string {
    return this.country;
  }

  getFullAddress(): string {
    return `${this.street}, ${this.ward}, ${this.district}, ${this.province}, ${this.country}`;
  }
}
