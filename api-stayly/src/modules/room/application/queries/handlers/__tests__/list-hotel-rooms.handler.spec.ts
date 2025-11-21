/**
 * Unit tests for ListHotelRoomsHandler
 */
import { Test, TestingModule } from "@nestjs/testing";
import { ListHotelRoomsHandler } from "../list-hotel-rooms.handler";
import { ListHotelRoomsQuery } from "../../list-hotel-rooms.query";
import { ROOM_TYPE_REPOSITORY } from "../../../../domain/repositories/room-type.repository.interface";
import { RoomDtoMapper } from "../../../../infrastructure/persistence/mappers/room-dto.mapper";
import { HotelRoom } from "../../../../domain/entities/hotel-room.entity";
import { RoomTypeId } from "../../../../domain/value-objects/room-type-id.vo";
import { RoomNumberVO } from "../../../../domain/value-objects/room-number.vo";
import { HotelRoomStatus } from "../../../../domain/value-objects/hotel-room-status.vo";

describe("ListHotelRoomsHandler", () => {
  let handler: ListHotelRoomsHandler;
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
        ListHotelRoomsHandler,
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

    handler = module.get<ListHotelRoomsHandler>(ListHotelRoomsHandler);
    roomTypeRepository = module.get(ROOM_TYPE_REPOSITORY);
    dtoMapper = module.get(RoomDtoMapper);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("execute", () => {
    it("should return paginated list of hotel rooms", async () => {
      // Arrange
      const roomTypeId = RoomTypeId.create(
        "123e4567-e89b-12d3-a456-426614174000",
      );
      const hotelRoom1 = HotelRoom.create({
        roomTypeId,
        roomNumber: RoomNumberVO.create("101"),
        floorId: "floor-1",
      });
      const hotelRoom2 = HotelRoom.create({
        roomTypeId,
        roomNumber: RoomNumberVO.create("102"),
        floorId: "floor-1",
      });

      const hotelRooms = [hotelRoom1, hotelRoom2];
      const query = new ListHotelRoomsQuery(
        undefined,
        undefined,
        undefined,
        1,
        10,
      );
      roomTypeRepository.findManyHotelRooms.mockResolvedValue(hotelRooms);
      roomTypeRepository.countHotelRooms.mockResolvedValue(2);

      const dto1 = {
        id: hotelRoom1.getId().getValue(),
        roomTypeId: roomTypeId.getValue(),
        roomNumber: "101",
        floorId: "floor-1",
        status: HotelRoomStatus.AVAILABLE,
      };
      const dto2 = {
        id: hotelRoom2.getId().getValue(),
        roomTypeId: roomTypeId.getValue(),
        roomNumber: "102",
        floorId: "floor-1",
        status: HotelRoomStatus.AVAILABLE,
      };

      dtoMapper.toHotelRoomDto
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
      expect(roomTypeRepository.findManyHotelRooms).toHaveBeenCalledWith(
        10,
        0,
        {
          roomTypeId: undefined,
          floorId: undefined,
          status: undefined,
        },
      );
      expect(roomTypeRepository.countHotelRooms).toHaveBeenCalledWith({
        roomTypeId: undefined,
        floorId: undefined,
        status: undefined,
      });
      expect(dtoMapper.toHotelRoomDto).toHaveBeenCalledTimes(2);
    });

    it("should return empty paginated result when no hotel rooms exist", async () => {
      // Arrange
      const query = new ListHotelRoomsQuery(
        undefined,
        undefined,
        undefined,
        1,
        10,
      );
      roomTypeRepository.findManyHotelRooms.mockResolvedValue([]);
      roomTypeRepository.countHotelRooms.mockResolvedValue(0);

      // Act
      const result = await handler.execute(query);

      // Assert
      expect(result).toBeDefined();
      expect(result.data).toEqual([]);
      expect(result.meta.total).toBe(0);
      expect(result.meta.current_page).toBe(1);
      expect(roomTypeRepository.findManyHotelRooms).toHaveBeenCalledWith(
        10,
        0,
        {
          roomTypeId: undefined,
          floorId: undefined,
          status: undefined,
        },
      );
      expect(roomTypeRepository.countHotelRooms).toHaveBeenCalledWith({
        roomTypeId: undefined,
        floorId: undefined,
        status: undefined,
      });
    });

    it("should filter by roomTypeId", async () => {
      // Arrange
      const roomTypeId = RoomTypeId.create(
        "123e4567-e89b-12d3-a456-426614174000",
      );
      const hotelRoom = HotelRoom.create({
        roomTypeId,
        roomNumber: RoomNumberVO.create("101"),
      });

      const query = new ListHotelRoomsQuery(
        roomTypeId.getValue(),
        undefined,
        undefined,
        1,
        10,
      );
      roomTypeRepository.findManyHotelRooms.mockResolvedValue([hotelRoom]);
      roomTypeRepository.countHotelRooms.mockResolvedValue(1);

      dtoMapper.toHotelRoomDto.mockReturnValue({
        id: hotelRoom.getId().getValue(),
        roomNumber: "101",
      });

      // Act
      const result = await handler.execute(query);

      // Assert
      expect(result.data).toHaveLength(1);
      expect(roomTypeRepository.findManyHotelRooms).toHaveBeenCalledWith(
        10,
        0,
        {
          roomTypeId: roomTypeId.getValue(),
          floorId: undefined,
          status: undefined,
        },
      );
      expect(roomTypeRepository.countHotelRooms).toHaveBeenCalledWith({
        roomTypeId: roomTypeId.getValue(),
        floorId: undefined,
        status: undefined,
      });
    });

    it("should filter by floorId", async () => {
      // Arrange
      const roomTypeId = RoomTypeId.create(
        "123e4567-e89b-12d3-a456-426614174000",
      );
      const hotelRoom = HotelRoom.create({
        roomTypeId,
        roomNumber: RoomNumberVO.create("101"),
        floorId: "floor-1",
      });

      const query = new ListHotelRoomsQuery(
        undefined,
        "floor-1",
        undefined,
        1,
        10,
      );
      roomTypeRepository.findManyHotelRooms.mockResolvedValue([hotelRoom]);
      roomTypeRepository.countHotelRooms.mockResolvedValue(1);

      dtoMapper.toHotelRoomDto.mockReturnValue({
        id: hotelRoom.getId().getValue(),
        floorId: "floor-1",
      });

      // Act
      const result = await handler.execute(query);

      // Assert
      expect(result.data).toHaveLength(1);
      expect(roomTypeRepository.findManyHotelRooms).toHaveBeenCalledWith(
        10,
        0,
        {
          roomTypeId: undefined,
          floorId: "floor-1",
          status: undefined,
        },
      );
      expect(roomTypeRepository.countHotelRooms).toHaveBeenCalledWith({
        roomTypeId: undefined,
        floorId: "floor-1",
        status: undefined,
      });
    });

    it("should filter by status", async () => {
      // Arrange
      const roomTypeId = RoomTypeId.create(
        "123e4567-e89b-12d3-a456-426614174000",
      );
      const hotelRoom = HotelRoom.create({
        roomTypeId,
        roomNumber: RoomNumberVO.create("101"),
      });

      const query = new ListHotelRoomsQuery(
        undefined,
        undefined,
        HotelRoomStatus.AVAILABLE,
        1,
        10,
      );
      roomTypeRepository.findManyHotelRooms.mockResolvedValue([hotelRoom]);
      roomTypeRepository.countHotelRooms.mockResolvedValue(1);

      dtoMapper.toHotelRoomDto.mockReturnValue({
        id: hotelRoom.getId().getValue(),
        status: HotelRoomStatus.AVAILABLE,
      });

      // Act
      const result = await handler.execute(query);

      // Assert
      expect(result.data).toHaveLength(1);
      expect(roomTypeRepository.findManyHotelRooms).toHaveBeenCalledWith(
        10,
        0,
        {
          roomTypeId: undefined,
          floorId: undefined,
          status: HotelRoomStatus.AVAILABLE,
        },
      );
      expect(roomTypeRepository.countHotelRooms).toHaveBeenCalledWith({
        roomTypeId: undefined,
        floorId: undefined,
        status: HotelRoomStatus.AVAILABLE,
      });
    });

    it("should handle pagination correctly", async () => {
      // Arrange
      const query = new ListHotelRoomsQuery(
        undefined,
        undefined,
        undefined,
        2,
        5,
      );
      roomTypeRepository.findManyHotelRooms.mockResolvedValue([]);
      roomTypeRepository.countHotelRooms.mockResolvedValue(10);

      // Act
      const result = await handler.execute(query);

      // Assert
      expect(result.meta.current_page).toBe(2);
      expect(result.meta.perpage).toBe(5);
      expect(result.meta.total).toBe(10);
      expect(roomTypeRepository.findManyHotelRooms).toHaveBeenCalledWith(5, 5, {
        roomTypeId: undefined,
        floorId: undefined,
        status: undefined,
      });
    });

    it("should map hotel rooms to DTOs correctly", async () => {
      // Arrange
      const roomTypeId = RoomTypeId.create(
        "123e4567-e89b-12d3-a456-426614174000",
      );
      const hotelRoom = HotelRoom.create({
        roomTypeId,
        roomNumber: RoomNumberVO.create("101"),
        floorId: "floor-1",
        notes: "Corner room",
      });

      const query = new ListHotelRoomsQuery(
        undefined,
        undefined,
        undefined,
        1,
        10,
      );
      roomTypeRepository.findManyHotelRooms.mockResolvedValue([hotelRoom]);
      roomTypeRepository.countHotelRooms.mockResolvedValue(1);

      const expectedDto = {
        id: hotelRoom.getId().getValue(),
        roomTypeId: roomTypeId.getValue(),
        roomNumber: "101",
        floorId: "floor-1",
        status: HotelRoomStatus.AVAILABLE,
        notes: "Corner room",
      };

      dtoMapper.toHotelRoomDto.mockReturnValue(expectedDto);

      // Act
      const result = await handler.execute(query);

      // Assert
      expect(dtoMapper.toHotelRoomDto).toHaveBeenCalledWith(hotelRoom);
      expect(result.data[0]).toEqual(expectedDto);
    });
  });
});
