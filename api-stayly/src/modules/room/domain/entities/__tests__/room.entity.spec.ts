import { Room } from "../room.entity";
import {
  RoomTypeCategoryVO,
  RoomTypeCategory,
} from "../../value-objects/room-type.vo";
import { BedTypeVO, BedType } from "../../value-objects/bed-type.vo";
import { GuestCapacityVO } from "../../value-objects/guest-capacity.vo";
import { RoomInventoryVO } from "../../value-objects/room-inventory.vo";
import { RoomImageVO, RoomImageType } from "../../value-objects/room-image.vo";
import { MoneyVO } from "../../value-objects/money.vo";
import {
  InvalidInputError,
  InvalidStateError,
} from "../../../../../common/domain/errors";

describe("Room Entity (Homestay)", () => {
  const validCategory = RoomTypeCategoryVO.create(RoomTypeCategory.DOUBLE);
  const validBedType = BedTypeVO.create(BedType.DOUBLE);
  const validGuestCapacity = GuestCapacityVO.create({
    maxAdults: 2,
    maxChildren: 1,
  });
  const validInventory = RoomInventoryVO.create(1);
  const validImages = [
    RoomImageVO.create({
      url: "image1.jpg",
      type: RoomImageType.INTERIOR,
      order: 0,
    }),
    RoomImageVO.create({
      url: "image2.jpg",
      type: RoomImageType.BATHROOM,
      order: 1,
    }),
  ];
  const validBasePrice = MoneyVO.create({ amount: 500000, currency: "VND" });

  describe("create", () => {
    it("should create a room successfully", () => {
      const room = Room.create({
        accommodationId: "accommodation-123",
        name: "Deluxe Room",
        category: validCategory,
        area: 25,
        guestCapacity: validGuestCapacity,
        bedCount: 1,
        bedType: validBedType,
        description: "A nice room",
        amenities: ["wifi", "tv"],
        images: validImages,
        inventory: validInventory,
        basePrice: validBasePrice,
      });

      expect(room).toBeDefined();
      expect(room.getId()).toBeDefined();
      expect(room.getAccommodationId()).toBe("accommodation-123");
      expect(room.getName()).toBe("Deluxe Room");
      expect(room.getStatus().isActive()).toBe(true);
    });

    it("should create a room without base price", () => {
      const room = Room.create({
        accommodationId: "accommodation-123",
        name: "Standard Room",
        category: validCategory,
        area: 20,
        guestCapacity: validGuestCapacity,
        bedCount: 1,
        bedType: validBedType,
        description: "A standard room",
        amenities: ["wifi"],
        images: validImages,
        inventory: validInventory,
      });

      expect(room).toBeDefined();
      expect(room.getBasePrice()).toBeUndefined();
    });

    it("should throw InvalidInputError if images are less than 2", () => {
      expect(() => {
        Room.create({
          accommodationId: "accommodation-123",
          name: "Deluxe Room",
          category: validCategory,
          area: 25,
          guestCapacity: validGuestCapacity,
          bedCount: 1,
          bedType: validBedType,
          description: "A nice room",
          amenities: ["wifi"],
          images: [RoomImageVO.create({ url: "image1.jpg" })],
          inventory: validInventory,
        });
      }).toThrow(InvalidInputError);
    });

    it("should throw InvalidInputError if images are more than 10", () => {
      const tooManyImages = Array(11)
        .fill(0)
        .map((_, i) => RoomImageVO.create({ url: `image${i}.jpg`, order: i }));

      expect(() => {
        Room.create({
          accommodationId: "accommodation-123",
          name: "Deluxe Room",
          category: validCategory,
          area: 25,
          guestCapacity: validGuestCapacity,
          bedCount: 1,
          bedType: validBedType,
          description: "A nice room",
          amenities: ["wifi"],
          images: tooManyImages,
          inventory: validInventory,
        });
      }).toThrow(InvalidInputError);
    });

    it("should throw InvalidInputError if area is not positive", () => {
      expect(() => {
        Room.create({
          accommodationId: "accommodation-123",
          name: "Deluxe Room",
          category: validCategory,
          area: 0,
          guestCapacity: validGuestCapacity,
          bedCount: 1,
          bedType: validBedType,
          description: "A nice room",
          amenities: ["wifi"],
          images: validImages,
          inventory: validInventory,
        });
      }).toThrow(InvalidInputError);
    });

    it("should throw InvalidInputError if bedCount is less than 1", () => {
      expect(() => {
        Room.create({
          accommodationId: "accommodation-123",
          name: "Deluxe Room",
          category: validCategory,
          area: 25,
          guestCapacity: validGuestCapacity,
          bedCount: 0,
          bedType: validBedType,
          description: "A nice room",
          amenities: ["wifi"],
          images: validImages,
          inventory: validInventory,
        });
      }).toThrow(InvalidInputError);
    });
  });

  describe("updateDescription", () => {
    let room: Room;

    beforeEach(() => {
      room = Room.create({
        accommodationId: "accommodation-123",
        name: "Deluxe Room",
        category: validCategory,
        area: 25,
        guestCapacity: validGuestCapacity,
        bedCount: 1,
        bedType: validBedType,
        description: "Original description",
        amenities: ["wifi"],
        images: validImages,
        inventory: validInventory,
      });
    });

    it("should update description successfully", () => {
      room.updateDescription("New description");
      expect(room.getDescription()).toBe("New description");
    });

    it("should throw InvalidInputError if description is empty", () => {
      expect(() => {
        room.updateDescription("");
      }).toThrow(InvalidInputError);
    });

    it("should trim whitespace from description", () => {
      room.updateDescription("  Trimmed description  ");
      expect(room.getDescription()).toBe("Trimmed description");
    });
  });

  describe("updateAmenities", () => {
    let room: Room;

    beforeEach(() => {
      room = Room.create({
        accommodationId: "accommodation-123",
        name: "Deluxe Room",
        category: validCategory,
        area: 25,
        guestCapacity: validGuestCapacity,
        bedCount: 1,
        bedType: validBedType,
        description: "A nice room",
        amenities: ["wifi"],
        images: validImages,
        inventory: validInventory,
      });
    });

    it("should update amenities successfully", () => {
      room.updateAmenities(["wifi", "tv", "ac"]);
      expect(room.getAmenities()).toEqual(["wifi", "tv", "ac"]);
    });

    it("should remove duplicates from amenities", () => {
      room.updateAmenities(["wifi", "wifi", "tv"]);
      expect(room.getAmenities()).toEqual(["wifi", "tv"]);
    });

    it("should throw InvalidInputError if amenities is empty", () => {
      expect(() => {
        room.updateAmenities([]);
      }).toThrow(InvalidInputError);
    });
  });

  describe("updateImages", () => {
    let room: Room;

    beforeEach(() => {
      room = Room.create({
        accommodationId: "accommodation-123",
        name: "Deluxe Room",
        category: validCategory,
        area: 25,
        guestCapacity: validGuestCapacity,
        bedCount: 1,
        bedType: validBedType,
        description: "A nice room",
        amenities: ["wifi"],
        images: validImages,
        inventory: validInventory,
      });
    });

    it("should update images successfully", () => {
      const newImages = [
        RoomImageVO.create({ url: "new1.jpg", order: 0 }),
        RoomImageVO.create({ url: "new2.jpg", order: 1 }),
      ];
      room.updateImages(newImages);
      expect(room.getImages()).toHaveLength(2);
    });

    it("should throw InvalidInputError if images is empty", () => {
      expect(() => {
        room.updateImages([]);
      }).toThrow(InvalidInputError);
    });
  });

  describe("activate", () => {
    it("should do nothing if already active", () => {
      const room = Room.create({
        accommodationId: "accommodation-123",
        name: "Deluxe Room",
        category: validCategory,
        area: 25,
        guestCapacity: validGuestCapacity,
        bedCount: 1,
        bedType: validBedType,
        description: "A nice room",
        amenities: ["wifi"],
        images: validImages,
        inventory: validInventory,
      });

      // Already active by default
      room.activate();
      expect(room.getStatus().isActive()).toBe(true);
    });
  });

  describe("deactivate", () => {
    it("should deactivate room with inventory 1", () => {
      const room = Room.create({
        accommodationId: "accommodation-123",
        name: "Deluxe Room",
        category: validCategory,
        area: 25,
        guestCapacity: validGuestCapacity,
        bedCount: 1,
        bedType: validBedType,
        description: "A nice room",
        amenities: ["wifi"],
        images: validImages,
        inventory: RoomInventoryVO.create(1),
      });

      room.deactivate();
      expect(room.getStatus().isInactive()).toBe(true);
    });

    it("should throw InvalidStateError if inventory is greater than 1", () => {
      const room = Room.create({
        accommodationId: "accommodation-123",
        name: "Deluxe Room",
        category: validCategory,
        area: 25,
        guestCapacity: validGuestCapacity,
        bedCount: 1,
        bedType: validBedType,
        description: "A nice room",
        amenities: ["wifi"],
        images: validImages,
        inventory: RoomInventoryVO.create(2),
      });

      expect(() => {
        room.deactivate();
      }).toThrow(InvalidStateError);
    });

    it("should do nothing if already inactive", () => {
      const room = Room.create({
        accommodationId: "accommodation-123",
        name: "Deluxe Room",
        category: validCategory,
        area: 25,
        guestCapacity: validGuestCapacity,
        bedCount: 1,
        bedType: validBedType,
        description: "A nice room",
        amenities: ["wifi"],
        images: validImages,
        inventory: RoomInventoryVO.create(1),
      });

      room.deactivate();
      room.deactivate(); // Should not throw
      expect(room.getStatus().isInactive()).toBe(true);
    });
  });
});
