import { Accommodation, AccommodationType } from "../accommodation.entity";
import { Address } from "../../value-objects/address.vo";
import { Location } from "../../value-objects/location.vo";
import { Policies } from "../../value-objects/policies.vo";
import {
  CancellationPolicy,
  CancellationPolicyType,
} from "../../value-objects/cancellation-policy.vo";
import { InvalidInputError } from "../../../../../common/domain/errors";

describe("Accommodation Entity - Update", () => {
  let accommodation: Accommodation;

  beforeEach(() => {
    const address = Address.create({
      street: "123 St",
      ward: "Ward",
      district: "District",
      province: "City",
      country: "Country",
    });
    const location = Location.create(10, 20);
    const policies = Policies.create({
      checkInTime: "14:00",
      checkOutTime: "12:00",
      childrenAllowed: true,
      petsAllowed: false,
      smokingAllowed: false,
    });
    const cancellationPolicy = CancellationPolicy.create({
      type: CancellationPolicyType.FLEXIBLE,
      freeCancellationDays: 1,
      refundPercentage: 100,
    });

    accommodation = Accommodation.create({
      type: AccommodationType.HOMESTAY,
      name: "Original Name",
      ownerId: "owner-1",
      address,
      location,
      description: "Original Description",
      images: ["img1", "img2", "img3"],
      amenities: ["wifi"],
      policies,
      cancellationPolicy,
    });
  });

  it("should update name", () => {
    accommodation.update({ name: "New Name" });
    expect(accommodation.getName()).toBe("New Name");
  });

  it("should throw error if name is empty", () => {
    expect(() => accommodation.update({ name: "" })).toThrow(InvalidInputError);
  });

  it("should update description", () => {
    accommodation.update({ description: "New Description" });
    expect(accommodation.getDescription()).toBe("New Description");
  });

  it("should update images with validation", () => {
    const newImages = ["img1", "img2", "img3", "img4"];
    accommodation.update({ images: newImages });
    expect(accommodation.getImages()).toEqual(newImages);
  });

  it("should throw error if images count is invalid for homestay", () => {
    expect(() => accommodation.update({ images: ["img1"] })).toThrow(
      InvalidInputError,
    );
  });
});
