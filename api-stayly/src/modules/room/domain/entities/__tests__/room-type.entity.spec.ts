import { RoomType } from "../room-type.entity";
import {
  RoomTypeCategoryVO,
  RoomTypeCategory,
} from "../../value-objects/room-type.vo";
import { BedTypeVO, BedType } from "../../value-objects/bed-type.vo";
import { GuestCapacityVO } from "../../value-objects/guest-capacity.vo";
import { RoomInventoryVO } from "../../value-objects/room-inventory.vo";
import { RoomImageVO, RoomImageType } from "../../value-objects/room-image.vo";
import { MoneyVO } from "../../value-objects/money.vo";
import { RoomNumberVO } from "../../value-objects/room-number.vo";
import {
  InvalidInputError,
  InvalidOperationError,
} from "../../../../../common/domain/errors";

describe("RoomType Entity (Hotel)", () => {
  const validCategory = RoomTypeCategoryVO.create(RoomTypeCategory.DOUBLE);
  const validBedType = BedTypeVO.create(BedType.DOUBLE);
  const validCapacity = GuestCapacityVO.create({
    maxAdults: 2,
    maxChildren: 1,
  });
  const validInventory = RoomInventoryVO.create(10);
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
    RoomImageVO.create({
      url: "image3.jpg",
      type: RoomImageType.VIEW,
      order: 2,
    }),
  ];
  const validBasePrice = MoneyVO.create({ amount: 1000000, currency: "VND" });

  describe("create", () => {
    it("should create a room type successfully", () => {
      const roomType = RoomType.create({
        hotelId: "hotel-123",
        name: "Deluxe Double",
        category: validCategory,
        area: 30,
        capacity: validCapacity,
        bedCount: 1,
        bedType: validBedType,
        description: "A luxury room",
        amenities: ["wifi", "tv", "minibar"],
        images: validImages,
        inventory: validInventory,
        basePrice: validBasePrice,
        viewDirection: "sea",
      });

      expect(roomType).toBeDefined();
      expect(roomType.getId()).toBeDefined();
      expect(roomType.getHotelId()).toBe("hotel-123");
      expect(roomType.getName()).toBe("Deluxe Double");
      expect(roomType.getStatus().isActive()).toBe(true);
      expect(roomType.getViewDirection()).toBe("sea");
    });

    it("should create a room type without view direction", () => {
      const roomType = RoomType.create({
        hotelId: "hotel-123",
        name: "Standard Room",
        category: validCategory,
        area: 25,
        capacity: validCapacity,
        bedCount: 1,
        bedType: validBedType,
        description: "A standard room",
        amenities: ["wifi"],
        images: validImages,
        inventory: validInventory,
        basePrice: validBasePrice,
      });

      expect(roomType).toBeDefined();
      expect(roomType.getViewDirection()).toBeUndefined();
    });

    it("should throw InvalidInputError if images are less than 3", () => {
      const insufficientImages = [
        RoomImageVO.create({ url: "image1.jpg" }),
        RoomImageVO.create({ url: "image2.jpg" }),
      ];

      expect(() => {
        RoomType.create({
          hotelId: "hotel-123",
          name: "Deluxe Double",
          category: validCategory,
          area: 30,
          capacity: validCapacity,
          bedCount: 1,
          bedType: validBedType,
          description: "A luxury room",
          amenities: ["wifi"],
          images: insufficientImages,
          inventory: validInventory,
          basePrice: validBasePrice,
        });
      }).toThrow(InvalidInputError);
    });

    it("should throw InvalidInputError if inventory is less than 1", () => {
      expect(() => {
        RoomType.create({
          hotelId: "hotel-123",
          name: "Deluxe Double",
          category: validCategory,
          area: 30,
          capacity: validCapacity,
          bedCount: 1,
          bedType: validBedType,
          description: "A luxury room",
          amenities: ["wifi"],
          images: validImages,
          inventory: RoomInventoryVO.create(0),
          basePrice: validBasePrice,
        });
      }).toThrow(InvalidInputError);
    });
  });

  describe("createHotelRoom", () => {
    let roomType: RoomType;

    beforeEach(() => {
      roomType = RoomType.create({
        hotelId: "hotel-123",
        name: "Deluxe Double",
        category: validCategory,
        area: 30,
        capacity: validCapacity,
        bedCount: 1,
        bedType: validBedType,
        description: "A luxury room",
        amenities: ["wifi"],
        images: validImages,
        inventory: RoomInventoryVO.create(5),
        basePrice: validBasePrice,
      });
    });

    it("should create a hotel room successfully", () => {
      const roomNumber = RoomNumberVO.create("101");
      const hotelRoom = roomType.createHotelRoom({
        roomNumber,
        floorId: "floor-1",
        notes: "Corner room",
      });

      expect(hotelRoom).toBeDefined();
      expect(hotelRoom.getRoomTypeId().getValue()).toBe(
        roomType.getId().getValue(),
      );
      expect(hotelRoom.getRoomNumber().getValue()).toBe("101");
      expect(hotelRoom.getFloorId()).toBe("floor-1");
      expect(hotelRoom.getNotes()).toBe("Corner room");
      expect(roomType.getRooms()).toHaveLength(1);
    });

    it("should create multiple hotel rooms up to inventory limit", () => {
      const room1 = roomType.createHotelRoom({
        roomNumber: RoomNumberVO.create("101"),
      });
      const room2 = roomType.createHotelRoom({
        roomNumber: RoomNumberVO.create("102"),
      });
      const room3 = roomType.createHotelRoom({
        roomNumber: RoomNumberVO.create("103"),
      });

      expect(roomType.getRooms()).toHaveLength(3);
      expect(room1).toBeDefined();
      expect(room2).toBeDefined();
      expect(room3).toBeDefined();
    });

    it("should throw InvalidOperationError if inventory is exhausted", () => {
      // Create 5 rooms (inventory limit)
      for (let i = 1; i <= 5; i++) {
        roomType.createHotelRoom({
          roomNumber: RoomNumberVO.create(`10${i}`),
        });
      }

      expect(() => {
        roomType.createHotelRoom({
          roomNumber: RoomNumberVO.create("106"),
        });
      }).toThrow(InvalidOperationError);
    });
  });

  describe("updateDescription", () => {
    let roomType: RoomType;

    beforeEach(() => {
      roomType = RoomType.create({
        hotelId: "hotel-123",
        name: "Deluxe Double",
        category: validCategory,
        area: 30,
        capacity: validCapacity,
        bedCount: 1,
        bedType: validBedType,
        description: "Original description",
        amenities: ["wifi"],
        images: validImages,
        inventory: validInventory,
        basePrice: validBasePrice,
      });
    });

    it("should update description successfully", () => {
      roomType.updateDescription("New description");
      expect(roomType.getDescription()).toBe("New description");
    });

    it("should throw InvalidInputError if description is empty", () => {
      expect(() => {
        roomType.updateDescription("");
      }).toThrow(InvalidInputError);
    });
  });

  describe("updateAmenities", () => {
    let roomType: RoomType;

    beforeEach(() => {
      roomType = RoomType.create({
        hotelId: "hotel-123",
        name: "Deluxe Double",
        category: validCategory,
        area: 30,
        capacity: validCapacity,
        bedCount: 1,
        bedType: validBedType,
        description: "A luxury room",
        amenities: ["wifi"],
        images: validImages,
        inventory: validInventory,
        basePrice: validBasePrice,
      });
    });

    it("should update amenities successfully", () => {
      roomType.updateAmenities(["wifi", "tv", "ac", "minibar"]);
      expect(roomType.getAmenities()).toEqual(["wifi", "tv", "ac", "minibar"]);
    });

    it("should throw InvalidInputError if amenities is empty", () => {
      expect(() => {
        roomType.updateAmenities([]);
      }).toThrow(InvalidInputError);
    });
  });

  describe("adjustInventory", () => {
    let roomType: RoomType;

    beforeEach(() => {
      roomType = RoomType.create({
        hotelId: "hotel-123",
        name: "Deluxe Double",
        category: validCategory,
        area: 30,
        capacity: validCapacity,
        bedCount: 1,
        bedType: validBedType,
        description: "A luxury room",
        amenities: ["wifi"],
        images: validImages,
        inventory: RoomInventoryVO.create(10),
        basePrice: validBasePrice,
      });
    });

    it("should adjust inventory successfully", () => {
      const newInventory = RoomInventoryVO.create(15);
      roomType.adjustInventory(newInventory);
      expect(roomType.getInventory().value()).toBe(15);
    });
  });

  describe("updateBasePrice", () => {
    let roomType: RoomType;

    beforeEach(() => {
      roomType = RoomType.create({
        hotelId: "hotel-123",
        name: "Deluxe Double",
        category: validCategory,
        area: 30,
        capacity: validCapacity,
        bedCount: 1,
        bedType: validBedType,
        description: "A luxury room",
        amenities: ["wifi"],
        images: validImages,
        inventory: validInventory,
        basePrice: validBasePrice,
      });
    });

    it("should update base price successfully", () => {
      const newPrice = MoneyVO.create({ amount: 1500000, currency: "VND" });
      roomType.updateBasePrice(newPrice);
      expect(roomType.getBasePrice().getAmount()).toBe(1500000);
    });
  });
});
