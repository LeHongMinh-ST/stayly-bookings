import { RoomAvailabilityService } from "../room-availability.service";
import { RoomId } from "../../value-objects/room-id.vo";
import { RoomTypeId } from "../../value-objects/room-type-id.vo";
import { HotelRoomId } from "../../value-objects/hotel-room-id.vo";
import { HotelRoomStatus } from "../../value-objects/hotel-room-status.vo";
import {
  NotFoundError,
  InvalidStateError,
} from "../../../../../common/domain/errors";
import type { IRoomRepository } from "../../repositories/room.repository.interface";
import type { IRoomTypeRepository } from "../../repositories/room-type.repository.interface";

describe("RoomAvailabilityService", () => {
  let service: RoomAvailabilityService;
  let roomRepository: {
    findById: jest.Mock;
  };
  let roomTypeRepository: {
    findById: jest.Mock;
    findHotelRoomById: jest.Mock;
  };

  beforeEach(() => {
    roomRepository = {
      findById: jest.fn(),
    };

    roomTypeRepository = {
      findById: jest.fn(),
      findHotelRoomById: jest.fn(),
    };

    service = new RoomAvailabilityService(
      roomRepository as IRoomRepository,
      roomTypeRepository as IRoomTypeRepository,
    );
  });

  describe("ensureHomestayRoomIsBookable", () => {
    it("should pass if room exists and is active", async () => {
      const roomId = RoomId.create(crypto.randomUUID());
      const mockRoom = {
        getStatus: jest.fn().mockReturnValue({
          isActive: jest.fn().mockReturnValue(true),
        }),
      };

      roomRepository.findById.mockResolvedValue(mockRoom);

      await expect(
        service.ensureHomestayRoomIsBookable(roomId),
      ).resolves.not.toThrow();
    });

    it("should throw NotFoundError if room does not exist", async () => {
      const roomId = RoomId.create(crypto.randomUUID());
      roomRepository.findById.mockResolvedValue(null);

      await expect(
        service.ensureHomestayRoomIsBookable(roomId),
      ).rejects.toThrow(NotFoundError);
    });

    it("should throw InvalidStateError if room is not active", async () => {
      const roomId = RoomId.create(crypto.randomUUID());
      const mockRoom = {
        getStatus: jest.fn().mockReturnValue({
          isActive: jest.fn().mockReturnValue(false),
        }),
      };

      roomRepository.findById.mockResolvedValue(mockRoom);

      await expect(
        service.ensureHomestayRoomIsBookable(roomId),
      ).rejects.toThrow(InvalidStateError);
    });
  });

  describe("ensureRoomTypeHasInventory", () => {
    it("should pass if room type exists, is active, and has inventory", async () => {
      const roomTypeId = RoomTypeId.create(crypto.randomUUID());
      const mockRoomType = {
        getStatus: jest.fn().mockReturnValue({
          isActive: jest.fn().mockReturnValue(true),
        }),
        getRooms: jest.fn().mockReturnValue([]),
        getInventory: jest.fn().mockReturnValue({
          value: jest.fn().mockReturnValue(10),
        }),
      };

      roomTypeRepository.findById.mockResolvedValue(mockRoomType);

      await expect(
        service.ensureRoomTypeHasInventory(roomTypeId),
      ).resolves.not.toThrow();
    });

    it("should throw NotFoundError if room type does not exist", async () => {
      const roomTypeId = RoomTypeId.create(crypto.randomUUID());
      roomTypeRepository.findById.mockResolvedValue(null);

      await expect(
        service.ensureRoomTypeHasInventory(roomTypeId),
      ).rejects.toThrow(NotFoundError);
    });

    it("should throw InvalidStateError if room type is not active", async () => {
      const roomTypeId = RoomTypeId.create(crypto.randomUUID());
      const mockRoomType = {
        getStatus: jest.fn().mockReturnValue({
          isActive: jest.fn().mockReturnValue(false),
        }),
        getRooms: jest.fn().mockReturnValue([]),
        getInventory: jest.fn().mockReturnValue({
          value: jest.fn().mockReturnValue(10),
        }),
      };

      roomTypeRepository.findById.mockResolvedValue(mockRoomType);

      await expect(
        service.ensureRoomTypeHasInventory(roomTypeId),
      ).rejects.toThrow(InvalidStateError);
    });

    it("should throw InvalidStateError if inventory is exhausted", async () => {
      const roomTypeId = RoomTypeId.create(crypto.randomUUID());
      const mockRooms = Array(10).fill({});
      const mockRoomType = {
        getStatus: jest.fn().mockReturnValue({
          isActive: jest.fn().mockReturnValue(true),
        }),
        getRooms: jest.fn().mockReturnValue(mockRooms),
        getInventory: jest.fn().mockReturnValue({
          value: jest.fn().mockReturnValue(10),
        }),
      };

      roomTypeRepository.findById.mockResolvedValue(mockRoomType);

      await expect(
        service.ensureRoomTypeHasInventory(roomTypeId),
      ).rejects.toThrow(InvalidStateError);
    });
  });

  describe("ensureHotelRoomIsAssignable", () => {
    it("should pass if hotel room exists and is available", async () => {
      const hotelRoomId = HotelRoomId.create(crypto.randomUUID());
      const mockHotelRoom = {
        getStatus: jest.fn().mockReturnValue({
          value: jest.fn().mockReturnValue(HotelRoomStatus.AVAILABLE),
        }),
      };

      roomTypeRepository.findHotelRoomById.mockResolvedValue(mockHotelRoom);

      await expect(
        service.ensureHotelRoomIsAssignable(hotelRoomId),
      ).resolves.not.toThrow();
    });

    it("should throw NotFoundError if hotel room does not exist", async () => {
      const hotelRoomId = HotelRoomId.create(crypto.randomUUID());
      roomTypeRepository.findHotelRoomById.mockResolvedValue(null);

      await expect(
        service.ensureHotelRoomIsAssignable(hotelRoomId),
      ).rejects.toThrow(NotFoundError);
    });

    it("should throw InvalidStateError if hotel room is not available", async () => {
      const hotelRoomId = HotelRoomId.create(crypto.randomUUID());
      const mockHotelRoom = {
        getStatus: jest.fn().mockReturnValue({
          value: jest.fn().mockReturnValue(HotelRoomStatus.OCCUPIED),
        }),
      };

      roomTypeRepository.findHotelRoomById.mockResolvedValue(mockHotelRoom);

      await expect(
        service.ensureHotelRoomIsAssignable(hotelRoomId),
      ).rejects.toThrow(InvalidStateError);
    });
  });
});
