import { HotelRoom } from "../hotel-room.entity";
import { RoomTypeId } from "../../value-objects/room-type-id.vo";
import { RoomNumberVO } from "../../value-objects/room-number.vo";
import { HotelRoomStatus } from "../../value-objects/hotel-room-status.vo";
import { InvalidInputError } from "../../../../../common/domain/errors";

describe("HotelRoom Entity", () => {
  const validRoomTypeId = RoomTypeId.create(crypto.randomUUID());
  const validRoomNumber = RoomNumberVO.create("101");

  describe("create", () => {
    it("should create a hotel room successfully", () => {
      const hotelRoom = HotelRoom.create({
        roomTypeId: validRoomTypeId,
        roomNumber: validRoomNumber,
        floorId: "floor-1",
        notes: "Corner room with sea view",
      });

      expect(hotelRoom).toBeDefined();
      expect(hotelRoom.getId()).toBeDefined();
      expect(hotelRoom.getRoomTypeId().getValue()).toBe(
        validRoomTypeId.getValue(),
      );
      expect(hotelRoom.getRoomNumber().getValue()).toBe("101");
      expect(hotelRoom.getFloorId()).toBe("floor-1");
      expect(hotelRoom.getNotes()).toBe("Corner room with sea view");
      expect(hotelRoom.getStatus().value()).toBe(HotelRoomStatus.AVAILABLE);
    });

    it("should create a hotel room without floorId and notes", () => {
      const hotelRoom = HotelRoom.create({
        roomTypeId: validRoomTypeId,
        roomNumber: validRoomNumber,
      });

      expect(hotelRoom).toBeDefined();
      expect(hotelRoom.getFloorId()).toBeUndefined();
      expect(hotelRoom.getNotes()).toBeUndefined();
    });
  });

  describe("markOccupied", () => {
    it("should mark room as occupied", () => {
      const hotelRoom = HotelRoom.create({
        roomTypeId: validRoomTypeId,
        roomNumber: validRoomNumber,
      });

      hotelRoom.markOccupied();
      expect(hotelRoom.getStatus().value()).toBe(HotelRoomStatus.OCCUPIED);
    });
  });

  describe("markClean", () => {
    it("should mark room as clean", () => {
      const hotelRoom = HotelRoom.create({
        roomTypeId: validRoomTypeId,
        roomNumber: validRoomNumber,
      });

      hotelRoom.markClean();
      expect(hotelRoom.getStatus().value()).toBe(HotelRoomStatus.CLEAN);
    });
  });

  describe("markDirty", () => {
    it("should mark room as dirty", () => {
      const hotelRoom = HotelRoom.create({
        roomTypeId: validRoomTypeId,
        roomNumber: validRoomNumber,
      });

      hotelRoom.markDirty();
      expect(hotelRoom.getStatus().value()).toBe(HotelRoomStatus.DIRTY);
    });
  });

  describe("markMaintenance", () => {
    it("should mark room as maintenance", () => {
      const hotelRoom = HotelRoom.create({
        roomTypeId: validRoomTypeId,
        roomNumber: validRoomNumber,
      });

      hotelRoom.markMaintenance();
      expect(hotelRoom.getStatus().value()).toBe(HotelRoomStatus.MAINTENANCE);
    });
  });

  describe("release", () => {
    it("should release room from occupied status", () => {
      const hotelRoom = HotelRoom.create({
        roomTypeId: validRoomTypeId,
        roomNumber: validRoomNumber,
      });

      hotelRoom.markOccupied();
      hotelRoom.release();
      expect(hotelRoom.getStatus().value()).toBe(HotelRoomStatus.AVAILABLE);
    });

    it("should release room from maintenance status", () => {
      const hotelRoom = HotelRoom.create({
        roomTypeId: validRoomTypeId,
        roomNumber: validRoomNumber,
      });

      hotelRoom.markMaintenance();
      hotelRoom.release();
      expect(hotelRoom.getStatus().value()).toBe(HotelRoomStatus.AVAILABLE);
    });

    it("should throw InvalidInputError if room is not occupied or maintenance", () => {
      const hotelRoom = HotelRoom.create({
        roomTypeId: validRoomTypeId,
        roomNumber: validRoomNumber,
      });

      // Room is AVAILABLE by default
      expect(() => {
        hotelRoom.release();
      }).toThrow(InvalidInputError);
    });

    it("should throw InvalidInputError if room is dirty", () => {
      const hotelRoom = HotelRoom.create({
        roomTypeId: validRoomTypeId,
        roomNumber: validRoomNumber,
      });

      hotelRoom.markDirty();
      expect(() => {
        hotelRoom.release();
      }).toThrow(InvalidInputError);
    });

    it("should throw InvalidInputError if room is clean", () => {
      const hotelRoom = HotelRoom.create({
        roomTypeId: validRoomTypeId,
        roomNumber: validRoomNumber,
      });

      hotelRoom.markClean();
      expect(() => {
        hotelRoom.release();
      }).toThrow(InvalidInputError);
    });
  });

  describe("updateRoomNumber", () => {
    it("should update room number successfully", () => {
      const hotelRoom = HotelRoom.create({
        roomTypeId: validRoomTypeId,
        roomNumber: validRoomNumber,
      });

      const newRoomNumber = RoomNumberVO.create("201");
      hotelRoom.updateRoomNumber(newRoomNumber);
      expect(hotelRoom.getRoomNumber().getValue()).toBe("201");
    });
  });

  describe("setNotes", () => {
    it("should set notes successfully", () => {
      const hotelRoom = HotelRoom.create({
        roomTypeId: validRoomTypeId,
        roomNumber: validRoomNumber,
      });

      hotelRoom.setNotes("Updated notes");
      expect(hotelRoom.getNotes()).toBe("Updated notes");
    });

    it("should clear notes when set to undefined", () => {
      const hotelRoom = HotelRoom.create({
        roomTypeId: validRoomTypeId,
        roomNumber: validRoomNumber,
        notes: "Original notes",
      });

      hotelRoom.setNotes(undefined);
      expect(hotelRoom.getNotes()).toBeUndefined();
    });
  });
});
