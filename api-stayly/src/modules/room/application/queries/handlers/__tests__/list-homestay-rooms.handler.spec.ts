/**
 * Unit tests for ListHomestayRoomsHandler
 */
import { Test, TestingModule } from "@nestjs/testing";
import { ListHomestayRoomsHandler } from "../list-homestay-rooms.handler";
import { ListHomestayRoomsQuery } from "../../list-homestay-rooms.query";
import { ROOM_REPOSITORY } from "../../../../domain/repositories/room.repository.interface";
import { RoomDtoMapper } from "../../../../infrastructure/persistence/mappers/room-dto.mapper";
import { RoomResponseDto } from "../../../dto/response/room-response.dto";
import { Room } from "../../../../domain/entities/room.entity";
import { RoomStatus } from "../../../../domain/value-objects/room-status.vo";
import {
  RoomTypeCategory,
  RoomTypeCategoryVO,
} from "../../../../domain/value-objects/room-type.vo";
import {
  BedType,
  BedTypeVO,
} from "../../../../domain/value-objects/bed-type.vo";
import { GuestCapacityVO } from "../../../../domain/value-objects/guest-capacity.vo";
import { RoomInventoryVO } from "../../../../domain/value-objects/room-inventory.vo";
import {
  RoomImageVO,
  RoomImageType,
} from "../../../../domain/value-objects/room-image.vo";
import { MoneyVO } from "../../../../domain/value-objects/money.vo";

describe("ListHomestayRoomsHandler", () => {
  let handler: ListHomestayRoomsHandler;
  let roomRepository: {
    findMany: jest.Mock;
    count: jest.Mock;
    save: jest.Mock;
    findById: jest.Mock;
    findByAccommodationId: jest.Mock;
    lockById: jest.Mock;
  };
  let dtoMapper: {
    toRoomDto: jest.Mock;
    toRoomTypeDto: jest.Mock;
    toHotelRoomDto: jest.Mock;
  };

  beforeEach(async () => {
    const mockRoomRepository = {
      findMany: jest.fn(),
      count: jest.fn(),
      save: jest.fn(),
      findById: jest.fn(),
      findByAccommodationId: jest.fn(),
      lockById: jest.fn(),
    };

    const mockDtoMapper = {
      toRoomDto: jest.fn(),
      toRoomTypeDto: jest.fn(),
      toHotelRoomDto: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ListHomestayRoomsHandler,
        {
          provide: ROOM_REPOSITORY,
          useValue: mockRoomRepository,
        },
        {
          provide: RoomDtoMapper,
          useValue: mockDtoMapper,
        },
      ],
    }).compile();

    handler = module.get<ListHomestayRoomsHandler>(ListHomestayRoomsHandler);
    roomRepository = module.get(ROOM_REPOSITORY);
    dtoMapper = module.get(RoomDtoMapper);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("execute", () => {
    it("should return paginated list of homestay rooms", async () => {
      // Arrange
      const room1 = Room.create({
        accommodationId: "accommodation-123",
        name: "Deluxe Room",
        category: RoomTypeCategoryVO.create(RoomTypeCategory.DOUBLE),
        area: 25,
        guestCapacity: GuestCapacityVO.create({ maxAdults: 2, maxChildren: 1 }),
        bedCount: 1,
        bedType: BedTypeVO.create(BedType.DOUBLE),
        description: "A nice room",
        amenities: ["wifi", "tv"],
        images: [
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
        ],
        inventory: RoomInventoryVO.create(1),
        basePrice: MoneyVO.create({ amount: 500000, currency: "VND" }),
      });

      const room2 = Room.create({
        accommodationId: "accommodation-123",
        name: "Standard Room",
        category: RoomTypeCategoryVO.create(RoomTypeCategory.SINGLE),
        area: 20,
        guestCapacity: GuestCapacityVO.create({ maxAdults: 1 }),
        bedCount: 1,
        bedType: BedTypeVO.create(BedType.SINGLE),
        description: "A standard room",
        amenities: ["wifi"],
        images: [
          RoomImageVO.create({
            url: "image3.jpg",
            type: RoomImageType.INTERIOR,
            order: 0,
          }),
          RoomImageVO.create({
            url: "image4.jpg",
            type: RoomImageType.BATHROOM,
            order: 1,
          }),
        ],
        inventory: RoomInventoryVO.create(1),
      });

      const rooms = [room1, room2];
      const query = new ListHomestayRoomsQuery(undefined, undefined, 1, 10);
      roomRepository.findMany.mockResolvedValue(rooms);
      roomRepository.count.mockResolvedValue(2);

      const dto1: RoomResponseDto = {
        id: room1.getId().getValue(),
        name: "Deluxe Room",
        accommodationId: "accommodation-123",
        status: RoomStatus.ACTIVE,
        category: RoomTypeCategory.DOUBLE,
        area: 25,
        bedCount: 1,
        bedType: BedType.DOUBLE,
        guestCapacity: { maxAdults: 2, maxChildren: 1, total: 3 },
        amenities: ["wifi", "tv"],
        images: [],
        inventory: 1,
        basePrice: { amount: 500000, currency: "VND" },
      };
      const dto2: RoomResponseDto = {
        id: room2.getId().getValue(),
        name: "Standard Room",
        accommodationId: "accommodation-123",
        status: RoomStatus.ACTIVE,
        category: RoomTypeCategory.SINGLE,
        area: 20,
        bedCount: 1,
        bedType: BedType.SINGLE,
        guestCapacity: { maxAdults: 1, maxChildren: 0, total: 1 },
        amenities: ["wifi"],
        images: [],
        inventory: 1,
      };

      dtoMapper.toRoomDto.mockReturnValueOnce(dto1).mockReturnValueOnce(dto2);

      // Act
      const result = await handler.execute(query);

      // Assert
      expect(result).toBeDefined();
      expect(result.data).toHaveLength(2);
      expect(result.meta.total).toBe(2);
      expect(result.meta.current_page).toBe(1);
      expect(result.meta.perpage).toBe(10);
      expect(roomRepository.findMany).toHaveBeenCalledWith(10, 0, {
        accommodationId: undefined,
        status: undefined,
      });
      expect(roomRepository.count).toHaveBeenCalledWith({
        accommodationId: undefined,
        status: undefined,
      });
      expect(dtoMapper.toRoomDto).toHaveBeenCalledTimes(2);
    });

    it("should return empty paginated result when no rooms exist", async () => {
      // Arrange
      const query = new ListHomestayRoomsQuery(undefined, undefined, 1, 10);
      roomRepository.findMany.mockResolvedValue([]);
      roomRepository.count.mockResolvedValue(0);

      // Act
      const result = await handler.execute(query);

      // Assert
      expect(result).toBeDefined();
      expect(result.data).toEqual([]);
      expect(result.meta.total).toBe(0);
      expect(result.meta.current_page).toBe(1);
      expect(roomRepository.findMany).toHaveBeenCalledWith(10, 0, {
        accommodationId: undefined,
        status: undefined,
      });
      expect(roomRepository.count).toHaveBeenCalledWith({
        accommodationId: undefined,
        status: undefined,
      });
    });

    it("should filter by accommodationId", async () => {
      // Arrange
      const room = Room.create({
        accommodationId: "accommodation-123",
        name: "Deluxe Room",
        category: RoomTypeCategoryVO.create(RoomTypeCategory.DOUBLE),
        area: 25,
        guestCapacity: GuestCapacityVO.create({ maxAdults: 2 }),
        bedCount: 1,
        bedType: BedTypeVO.create(BedType.DOUBLE),
        description: "A nice room",
        amenities: ["wifi"],
        images: [
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
        ],
        inventory: RoomInventoryVO.create(1),
      });

      const query = new ListHomestayRoomsQuery(
        "accommodation-123",
        undefined,
        1,
        10,
      );
      roomRepository.findMany.mockResolvedValue([room]);
      roomRepository.count.mockResolvedValue(1);

      dtoMapper.toRoomDto.mockReturnValue({
        id: room.getId().getValue(),
        name: "Deluxe Room",
        accommodationId: "accommodation-123",
        status: RoomStatus.ACTIVE,
        category: RoomTypeCategory.DOUBLE,
        area: 25,
        bedCount: 1,
        bedType: BedType.DOUBLE,
        guestCapacity: { maxAdults: 2, maxChildren: 0, total: 2 },
        amenities: ["wifi"],
        images: [],
        inventory: 1,
      } as RoomResponseDto);

      // Act
      const result = await handler.execute(query);

      // Assert
      expect(result.data).toHaveLength(1);
      expect(roomRepository.findMany).toHaveBeenCalledWith(10, 0, {
        accommodationId: "accommodation-123",
        status: undefined,
      });
      expect(roomRepository.count).toHaveBeenCalledWith({
        accommodationId: "accommodation-123",
        status: undefined,
      });
    });

    it("should filter by status", async () => {
      // Arrange
      const room = Room.create({
        accommodationId: "accommodation-123",
        name: "Deluxe Room",
        category: RoomTypeCategoryVO.create(RoomTypeCategory.DOUBLE),
        area: 25,
        guestCapacity: GuestCapacityVO.create({ maxAdults: 2 }),
        bedCount: 1,
        bedType: BedTypeVO.create(BedType.DOUBLE),
        description: "A nice room",
        amenities: ["wifi"],
        images: [
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
        ],
        inventory: RoomInventoryVO.create(1),
      });

      const query = new ListHomestayRoomsQuery(
        undefined,
        RoomStatus.ACTIVE,
        1,
        10,
      );
      roomRepository.findMany.mockResolvedValue([room]);
      roomRepository.count.mockResolvedValue(1);

      dtoMapper.toRoomDto.mockReturnValue({
        id: room.getId().getValue(),
        status: RoomStatus.ACTIVE,
        accommodationId: "accommodation-123",
        name: "Deluxe Room",
        category: RoomTypeCategory.DOUBLE,
        area: 25,
        bedCount: 1,
        bedType: BedType.DOUBLE,
        guestCapacity: { maxAdults: 2, maxChildren: 0, total: 2 },
        amenities: ["wifi"],
        images: [],
        inventory: 1,
      } as RoomResponseDto);

      // Act
      const result = await handler.execute(query);

      // Assert
      expect(result.data).toHaveLength(1);
      expect(roomRepository.findMany).toHaveBeenCalledWith(10, 0, {
        accommodationId: undefined,
        status: RoomStatus.ACTIVE,
      });
      expect(roomRepository.count).toHaveBeenCalledWith({
        accommodationId: undefined,
        status: RoomStatus.ACTIVE,
      });
    });

    it("should handle pagination correctly", async () => {
      // Arrange
      const query = new ListHomestayRoomsQuery(undefined, undefined, 2, 5);
      roomRepository.findMany.mockResolvedValue([]);
      roomRepository.count.mockResolvedValue(10);

      // Act
      const result = await handler.execute(query);

      // Assert
      expect(result.meta.current_page).toBe(2);
      expect(result.meta.perpage).toBe(5);
      expect(result.meta.total).toBe(10);
      expect(roomRepository.findMany).toHaveBeenCalledWith(5, 5, {
        accommodationId: undefined,
        status: undefined,
      });
    });

    it("should map rooms to DTOs correctly", async () => {
      // Arrange
      const room = Room.create({
        accommodationId: "accommodation-123",
        name: "Deluxe Room",
        category: RoomTypeCategoryVO.create(RoomTypeCategory.DOUBLE),
        area: 25,
        guestCapacity: GuestCapacityVO.create({ maxAdults: 2 }),
        bedCount: 1,
        bedType: BedTypeVO.create(BedType.DOUBLE),
        description: "A nice room",
        amenities: ["wifi"],
        images: [
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
        ],
        inventory: RoomInventoryVO.create(1),
      });

      const query = new ListHomestayRoomsQuery(undefined, undefined, 1, 10);
      roomRepository.findMany.mockResolvedValue([room]);
      roomRepository.count.mockResolvedValue(1);

      const expectedDto: RoomResponseDto = {
        id: room.getId().getValue(),
        name: "Deluxe Room",
        accommodationId: "accommodation-123",
        status: RoomStatus.ACTIVE,
        category: RoomTypeCategory.DOUBLE,
        area: 25,
        bedCount: 1,
        bedType: BedType.DOUBLE,
        guestCapacity: { maxAdults: 2, maxChildren: 0, total: 2 },
        amenities: ["wifi"],
        images: [],
        inventory: 1,
      };

      dtoMapper.toRoomDto.mockReturnValue(expectedDto);

      // Act
      const result = await handler.execute(query);

      // Assert
      expect(dtoMapper.toRoomDto).toHaveBeenCalledWith(room);
      expect(result.data[0]).toEqual(expectedDto);
    });
  });
});
