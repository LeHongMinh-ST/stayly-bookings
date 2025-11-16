/**
 * Location Value Object
 * Represents GPS coordinates (latitude, longitude)
 */

import { InvalidInputError } from "../../../../common/domain/errors";

export class Location {
  private constructor(
    private readonly latitude: number,
    private readonly longitude: number,
  ) {
    if (latitude < -90 || latitude > 90) {
      throw new InvalidInputError("Latitude must be between -90 and 90");
    }
    if (longitude < -180 || longitude > 180) {
      throw new InvalidInputError("Longitude must be between -180 and 180");
    }
  }

  static create(latitude: number, longitude: number): Location {
    return new Location(latitude, longitude);
  }

  getLatitude(): number {
    return this.latitude;
  }

  getLongitude(): number {
    return this.longitude;
  }

  equals(other: Location): boolean {
    return (
      this.latitude === other.latitude && this.longitude === other.longitude
    );
  }
}
