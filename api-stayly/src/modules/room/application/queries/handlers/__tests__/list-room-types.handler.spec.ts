/**
 * Unit tests for ListRoomTypesHandler
 */
import { Test, TestingModule } from "@nestjs/testing";
import { ListRoomTypesHandler } from "../list-room-types.handler";
import { ListRoomTypesQuery } from "../../list-room-types.query";
import { ROOM_TYPE_REPOSITORY } from "../../../../domain/repositories/room-type.repository.interface";
import { RoomDtoMapper } from "../../../../infrastructure/persistence/mappers/room-dto.mapper";
import { RoomTypeResponseDto } from "../../../dto/response/room-type-response.dto";
import { RoomType } from "../../../../domain/entities/room-type.entity";
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

describe("ListRoomTypesHandler", () => {
  let handler: ListRoomTypesHandler;
  let roomTypeRepository: {
    findMany: jest.Mock;
    count: jest.Mock;
    save: jest.Mock;
    findById: jest.Mock;
    findByHotelId: jest.Mock;
    lockById: jest.Mock;
    saveHotelRoom: jest.Mock;
    findHotelRoomById: jest.Mock;
    findHotelRoomsByType: jest.Mock;
    lockHotelRoomById: jest.Mock;
    findManyHotelRooms: jest.Mock;
    countHotelRooms: jest.Mock;
    findRoomOverviewForAccommodation: jest.Mock;
  };
  let dtoMapper: {
    toRoomDto: jest.Mock;
    toRoomTypeDto: jest.Mock;
    toHotelRoomDto: jest.Mock;
  };

  beforeEach(async () => {
    const mockRoomTypeRepository = {
      findMany: jest.fn(),
      count: jest.fn(),
      save: jest.fn(),
      findById: jest.fn(),
      findByHotelId: jest.fn(),
      lockById: jest.fn(),
      saveHotelRoom: jest.fn(),
      findHotelRoomById: jest.fn(),
      findHotelRoomsByType: jest.fn(),
      lockHotelRoomById: jest.fn(),
      findManyHotelRooms: jest.fn(),
      countHotelRooms: jest.fn(),
      findRoomOverviewForAccommodation: jest.fn(),
    };

    const mockDtoMapper = {
      toRoomDto: jest.fn(),
      toRoomTypeDto: jest.fn(),
      toHotelRoomDto: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ListRoomTypesHandler,
        {
          provide: ROOM_TYPE_REPOSITORY,
          useValue: mockRoomTypeRepository,
        },
        {
          provide: RoomDtoMapper,
          useValue: mockDtoMapper,
        },
      ],
    }).compile();

    handler = module.get<ListRoomTypesHandler>(ListRoomTypesHandler);
    roomTypeRepository = module.get(ROOM_TYPE_REPOSITORY);
    dtoMapper = module.get(RoomDtoMapper);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("execute", () => {
    it("should return paginated list of room types", async () => {
      // Arrange
      const roomType1 = RoomType.create({
        hotelId: "hotel-123",
        name: "Deluxe Double",
        category: RoomTypeCategoryVO.create(RoomTypeCategory.DOUBLE),
        area: 30,
        capacity: GuestCapacityVO.create({ maxAdults: 2, maxChildren: 1 }),
        bedCount: 1,
        bedType: BedTypeVO.create(BedType.DOUBLE),
        description: "A nice room type",
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
          RoomImageVO.create({
            url: "image3.jpg",
            type: RoomImageType.VIEW,
            order: 2,
          }),
        ],
        inventory: RoomInventoryVO.create(10),
        basePrice: MoneyVO.create({ amount: 1000000, currency: "VND" }),
      });

      const roomType2 = RoomType.create({
        hotelId: "hotel-123",
        name: "Standard Single",
        category: RoomTypeCategoryVO.create(RoomTypeCategory.SINGLE),
        area: 20,
        capacity: GuestCapacityVO.create({ maxAdults: 1 }),
        bedCount: 1,
        bedType: BedTypeVO.create(BedType.SINGLE),
        description: "A standard room type",
        amenities: ["wifi"],
        images: [
          RoomImageVO.create({
            url: "image4.jpg",
            type: RoomImageType.INTERIOR,
            order: 0,
          }),
          RoomImageVO.create({
            url: "image5.jpg",
            type: RoomImageType.BATHROOM,
            order: 1,
          }),
          RoomImageVO.create({
            url: "image6.jpg",
            type: RoomImageType.VIEW,
            order: 2,
          }),
        ],
        inventory: RoomInventoryVO.create(5),
        basePrice: MoneyVO.create({ amount: 500000, currency: "VND" }),
      });

      const roomTypes = [roomType1, roomType2];
      const query = new ListRoomTypesQuery(undefined, undefined, 1, 10);
      roomTypeRepository.findMany.mockResolvedValue(roomTypes);
      roomTypeRepository.count.mockResolvedValue(2);

      const dto1: RoomTypeResponseDto = {
        id: roomType1.getId().getValue(),
        name: "Deluxe Double",
        hotelId: "hotel-123",
        status: RoomStatus.ACTIVE,
        category: RoomTypeCategory.DOUBLE,
        area: 30,
        bedCount: 1,
        bedType: BedType.DOUBLE,
        capacity: { maxAdults: 2, maxChildren: 1, total: 3 },
        amenities: ["wifi", "tv"],
        images: [],
        inventory: 10,
        basePrice: { amount: 1000000, currency: "VND" },
      };
      const dto2: RoomTypeResponseDto = {
        id: roomType2.getId().getValue(),
        name: "Standard Single",
        hotelId: "hotel-123",
        status: RoomStatus.ACTIVE,
        category: RoomTypeCategory.SINGLE,
        area: 20,
        bedCount: 1,
        bedType: BedType.SINGLE,
        capacity: { maxAdults: 1, maxChildren: 0, total: 1 },
        amenities: ["wifi"],
        images: [],
        inventory: 5,
        basePrice: { amount: 500000, currency: "VND" },
      };

      dtoMapper.toRoomTypeDto
        .mockReturnValueOnce(dto1)
        .mockReturnValueOnce(dto2);

      // Act
      const result = await handler.execute(query);

      // Assert
      expect(result).toBeDefined();
      expect(result.data).toHaveLength(2);
      expect(result.meta.total).toBe(2);
      expect(result.meta.current_page).toBe(1);
      expect(result.meta.perpage).toBe(10);
      expect(roomTypeRepository.findMany).toHaveBeenCalledWith(10, 0, {
        hotelId: undefined,
        status: undefined,
      });
      expect(roomTypeRepository.count).toHaveBeenCalledWith({
        hotelId: undefined,
        status: undefined,
      });
      expect(dtoMapper.toRoomTypeDto).toHaveBeenCalledTimes(2);
    });

    it("should return empty paginated result when no room types exist", async () => {
      // Arrange
      const query = new ListRoomTypesQuery(undefined, undefined, 1, 10);
      roomTypeRepository.findMany.mockResolvedValue([]);
      roomTypeRepository.count.mockResolvedValue(0);

      // Act
      const result = await handler.execute(query);

      // Assert
      expect(result).toBeDefined();
      expect(result.data).toEqual([]);
      expect(result.meta.total).toBe(0);
      expect(result.meta.current_page).toBe(1);
      expect(roomTypeRepository.findMany).toHaveBeenCalledWith(10, 0, {
        hotelId: undefined,
        status: undefined,
      });
      expect(roomTypeRepository.count).toHaveBeenCalledWith({
        hotelId: undefined,
        status: undefined,
      });
    });

    it("should filter by hotelId", async () => {
      // Arrange
      const roomType = RoomType.create({
        hotelId: "hotel-123",
        name: "Deluxe Double",
        category: RoomTypeCategoryVO.create(RoomTypeCategory.DOUBLE),
        area: 30,
        capacity: GuestCapacityVO.create({ maxAdults: 2 }),
        bedCount: 1,
        bedType: BedTypeVO.create(BedType.DOUBLE),
        description: "A nice room type",
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
          RoomImageVO.create({
            url: "image3.jpg",
            type: RoomImageType.VIEW,
            order: 2,
          }),
        ],
        inventory: RoomInventoryVO.create(10),
        basePrice: MoneyVO.create({ amount: 1000000, currency: "VND" }),
      });

      const query = new ListRoomTypesQuery("hotel-123", undefined, 1, 10);
      roomTypeRepository.findMany.mockResolvedValue([roomType]);
      roomTypeRepository.count.mockResolvedValue(1);

      dtoMapper.toRoomTypeDto.mockReturnValue({
        id: roomType.getId().getValue(),
        name: "Deluxe Double",
        hotelId: "hotel-123",
        status: RoomStatus.ACTIVE,
        category: RoomTypeCategory.DOUBLE,
        area: 30,
        bedCount: 1,
        bedType: BedType.DOUBLE,
        capacity: { maxAdults: 2, maxChildren: 0, total: 2 },
        amenities: ["wifi"],
        images: [],
        inventory: 10,
        basePrice: { amount: 1000000, currency: "VND" },
      } as RoomTypeResponseDto);

      // Act
      const result = await handler.execute(query);

      // Assert
      expect(result.data).toHaveLength(1);
      expect(roomTypeRepository.findMany).toHaveBeenCalledWith(10, 0, {
        hotelId: "hotel-123",
        status: undefined,
      });
      expect(roomTypeRepository.count).toHaveBeenCalledWith({
        hotelId: "hotel-123",
        status: undefined,
      });
    });

    it("should filter by status", async () => {
      // Arrange
      const roomType = RoomType.create({
        hotelId: "hotel-123",
        name: "Deluxe Double",
        category: RoomTypeCategoryVO.create(RoomTypeCategory.DOUBLE),
        area: 30,
        capacity: GuestCapacityVO.create({ maxAdults: 2 }),
        bedCount: 1,
        bedType: BedTypeVO.create(BedType.DOUBLE),
        description: "A nice room type",
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
          RoomImageVO.create({
            url: "image3.jpg",
            type: RoomImageType.VIEW,
            order: 2,
          }),
        ],
        inventory: RoomInventoryVO.create(10),
        basePrice: MoneyVO.create({ amount: 1000000, currency: "VND" }),
      });

      const query = new ListRoomTypesQuery(undefined, RoomStatus.ACTIVE, 1, 10);
      roomTypeRepository.findMany.mockResolvedValue([roomType]);
      roomTypeRepository.count.mockResolvedValue(1);

      dtoMapper.toRoomTypeDto.mockReturnValue({
        id: roomType.getId().getValue(),
        status: RoomStatus.ACTIVE,
        hotelId: "hotel-123",
        name: "Deluxe Double",
        category: RoomTypeCategory.DOUBLE,
        area: 30,
        bedCount: 1,
        bedType: BedType.DOUBLE,
        capacity: { maxAdults: 2, maxChildren: 0, total: 2 },
        amenities: ["wifi"],
        images: [],
        inventory: 10,
        basePrice: { amount: 1000000, currency: "VND" },
      } as RoomTypeResponseDto);

      // Act
      const result = await handler.execute(query);

      // Assert
      expect(result.data).toHaveLength(1);
      expect(roomTypeRepository.findMany).toHaveBeenCalledWith(10, 0, {
        hotelId: undefined,
        status: RoomStatus.ACTIVE,
      });
      expect(roomTypeRepository.count).toHaveBeenCalledWith({
        hotelId: undefined,
        status: RoomStatus.ACTIVE,
      });
    });

    it("should handle pagination correctly", async () => {
      // Arrange
      const query = new ListRoomTypesQuery(undefined, undefined, 2, 5);
      roomTypeRepository.findMany.mockResolvedValue([]);
      roomTypeRepository.count.mockResolvedValue(10);

      // Act
      const result = await handler.execute(query);

      // Assert
      expect(result.meta.current_page).toBe(2);
      expect(result.meta.perpage).toBe(5);
      expect(result.meta.total).toBe(10);
      expect(roomTypeRepository.findMany).toHaveBeenCalledWith(5, 5, {
        hotelId: undefined,
        status: undefined,
      });
    });

    it("should map room types to DTOs correctly", async () => {
      // Arrange
      const roomType = RoomType.create({
        hotelId: "hotel-123",
        name: "Deluxe Double",
        category: RoomTypeCategoryVO.create(RoomTypeCategory.DOUBLE),
        area: 30,
        capacity: GuestCapacityVO.create({ maxAdults: 2 }),
        bedCount: 1,
        bedType: BedTypeVO.create(BedType.DOUBLE),
        description: "A nice room type",
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
          RoomImageVO.create({
            url: "image3.jpg",
            type: RoomImageType.VIEW,
            order: 2,
          }),
        ],
        inventory: RoomInventoryVO.create(10),
        basePrice: MoneyVO.create({ amount: 1000000, currency: "VND" }),
      });

      const query = new ListRoomTypesQuery(undefined, undefined, 1, 10);
      roomTypeRepository.findMany.mockResolvedValue([roomType]);
      roomTypeRepository.count.mockResolvedValue(1);

      const expectedDto: RoomTypeResponseDto = {
        id: roomType.getId().getValue(),
        name: "Deluxe Double",
        hotelId: "hotel-123",
        status: RoomStatus.ACTIVE,
        category: RoomTypeCategory.DOUBLE,
        area: 30,
        bedCount: 1,
        bedType: BedType.DOUBLE,
        capacity: { maxAdults: 2, maxChildren: 0, total: 2 },
        amenities: ["wifi"],
        images: [],
        inventory: 10,
        basePrice: { amount: 1000000, currency: "VND" },
      };

      dtoMapper.toRoomTypeDto.mockReturnValue(expectedDto);

      // Act
      const result = await handler.execute(query);

      // Assert
      expect(dtoMapper.toRoomTypeDto).toHaveBeenCalledWith(roomType);
      expect(result.data[0]).toEqual(expectedDto);
    });
  });
});
