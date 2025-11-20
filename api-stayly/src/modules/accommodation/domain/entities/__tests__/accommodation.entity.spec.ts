import { Accommodation, AccommodationType } from "../accommodation.entity";

import { Address } from "../../value-objects/address.vo";
import { Location } from "../../value-objects/location.vo";
import { Policies } from "../../value-objects/policies.vo";
import {
  CancellationPolicy,
  CancellationPolicyType,
} from "../../value-objects/cancellation-policy.vo";
import {
  InvalidInputError,
  InvalidStateError,
} from "../../../../../common/domain/errors";

describe("Accommodation Entity", () => {
  const validAddress = Address.create({
    street: "123 Main St",
    ward: "Ward 1",
    district: "District 1",
    province: "HCMC",
    country: "Vietnam",
  });

  const validLocation = Location.create(10.762622, 106.660172);

  const validPolicies = Policies.create({
    checkInTime: "14:00",
    checkOutTime: "12:00",
    childrenAllowed: true,
    petsAllowed: false,
    smokingAllowed: false,
  });

  const validCancellationPolicy = CancellationPolicy.create({
    type: CancellationPolicyType.FLEXIBLE,
    freeCancellationDays: 1,
    refundPercentage: 100,
  });

  const validImages = ["image1.jpg", "image2.jpg", "image3.jpg"];

  describe("create", () => {
    it("should create a Homestay successfully", () => {
      const accommodation = Accommodation.create({
        ownerId: "owner-123",
        type: AccommodationType.HOMESTAY,
        name: "Cozy Homestay",
        description: "A nice place",
        address: validAddress,
        location: validLocation,
        images: validImages, // 3 images
        amenities: ["Wifi"],
        policies: validPolicies,
        cancellationPolicy: validCancellationPolicy,
      });

      expect(accommodation).toBeDefined();
      expect(accommodation.getId()).toBeDefined();
      expect(accommodation.getStatus().isActive()).toBe(true); // Should be ACTIVE by default
    });

    it("should create a Hotel successfully", () => {
      const hotelImages = Array(5).fill("image.jpg") as string[];
      const accommodation = Accommodation.create({
        ownerId: "owner-123",
        type: AccommodationType.HOTEL,
        name: "Luxury Hotel",
        description: "A luxury place",
        address: validAddress,
        location: validLocation,
        images: hotelImages, // 5 images
        amenities: ["Wifi", "Pool"],
        policies: validPolicies,
        cancellationPolicy: validCancellationPolicy,
        starRating: 5,
      });

      expect(accommodation).toBeDefined();
      expect(accommodation.getType()).toBe(AccommodationType.HOTEL);
    });

    it("should throw InvalidInputError if Homestay has fewer than 3 images", () => {
      expect(() => {
        Accommodation.create({
          ownerId: "owner-123",
          type: AccommodationType.HOMESTAY,
          name: "Cozy Homestay",
          description: "A nice place",
          address: validAddress,
          location: validLocation,
          images: ["image1.jpg"], // Only 1 image
          amenities: ["Wifi"],
          policies: validPolicies,
          cancellationPolicy: validCancellationPolicy,
        });
      }).toThrow(InvalidInputError);
    });

    it("should throw InvalidInputError if Hotel has fewer than 5 images", () => {
      expect(() => {
        Accommodation.create({
          ownerId: "owner-123",
          type: AccommodationType.HOTEL,
          name: "Luxury Hotel",
          description: "A luxury place",
          address: validAddress,
          location: validLocation,
          images: ["image1.jpg", "image2.jpg", "image3.jpg"], // Only 3 images
          amenities: ["Wifi"],
          policies: validPolicies,
          cancellationPolicy: validCancellationPolicy,
          starRating: 5,
        });
      }).toThrow(InvalidInputError);
    });
  });

  describe("activate", () => {
    it("should do nothing if already active", () => {
      const accommodation = Accommodation.create({
        ownerId: "owner-123",
        type: AccommodationType.HOMESTAY,
        name: "Cozy Homestay",
        description: "A nice place",
        address: validAddress,
        location: validLocation,
        images: validImages,
        amenities: ["Wifi"],
        policies: validPolicies,
        cancellationPolicy: validCancellationPolicy,
      });

      // Already active by default
      accommodation.activate();
      expect(accommodation.getStatus().isActive()).toBe(true);
    });
  });

  describe("suspend", () => {
    it("should suspend an active accommodation", () => {
      const accommodation = Accommodation.create({
        ownerId: "owner-123",
        type: AccommodationType.HOMESTAY,
        name: "Cozy Homestay",
        description: "A nice place",
        address: validAddress,
        location: validLocation,
        images: validImages,
        amenities: ["Wifi"],
        policies: validPolicies,
        cancellationPolicy: validCancellationPolicy,
      });

      accommodation.suspend();
      expect(accommodation.getStatus().isSuspended()).toBe(true);
    });

    it("should throw InvalidStateError if suspending an inactive accommodation", () => {
      const accommodation = Accommodation.create({
        ownerId: "owner-123",
        type: AccommodationType.HOMESTAY,
        name: "Cozy Homestay",
        description: "A nice place",
        address: validAddress,
        location: validLocation,
        images: validImages,
        amenities: ["Wifi"],
        policies: validPolicies,
        cancellationPolicy: validCancellationPolicy,
      });

      accommodation.suspend(); // Now SUSPENDED

      // Try to suspend again (which technically checks if active)
      expect(() => {
        accommodation.suspend();
      }).toThrow(InvalidStateError);
    });
  });

  describe("updateName", () => {
    it("should update name successfully", () => {
      const accommodation = Accommodation.create({
        ownerId: "owner-123",
        type: AccommodationType.HOMESTAY,
        name: "Cozy Homestay",
        description: "A nice place",
        address: validAddress,
        location: validLocation,
        images: validImages,
        amenities: ["Wifi"],
        policies: validPolicies,
        cancellationPolicy: validCancellationPolicy,
      });

      accommodation.updateName("New Name");
      expect(accommodation.getName()).toBe("New Name");
    });

    it("should throw InvalidInputError if name is empty", () => {
      const accommodation = Accommodation.create({
        ownerId: "owner-123",
        type: AccommodationType.HOMESTAY,
        name: "Cozy Homestay",
        description: "A nice place",
        address: validAddress,
        location: validLocation,
        images: validImages,
        amenities: ["Wifi"],
        policies: validPolicies,
        cancellationPolicy: validCancellationPolicy,
      });

      expect(() => {
        accommodation.updateName("");
      }).toThrow(InvalidInputError);
    });
  });
});
