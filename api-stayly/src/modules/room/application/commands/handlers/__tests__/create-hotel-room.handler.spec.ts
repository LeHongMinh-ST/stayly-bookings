import { Test, TestingModule } from "@nestjs/testing";
import { EventBus } from "@nestjs/cqrs";
import { CreateHotelRoomHandler } from "../create-hotel-room.handler";
import { CreateHotelRoomCommand } from "../../create-hotel-room.command";
import { ROOM_TYPE_REPOSITORY } from "../../../../domain/repositories/room-type.repository.interface";
import { NotFoundError } from "../../../../../../common/domain/errors";
import { HotelRoomStatus } from "../../../../domain/value-objects/hotel-room-status.vo";

describe("CreateHotelRoomHandler", () => {
  let handler: CreateHotelRoomHandler;
  let roomTypeRepository: {
    findById: jest.Mock;
    save: jest.Mock;
    saveHotelRoom: jest.Mock;
  };
  let eventBus: { publish: jest.Mock };

  const mockRoomTypeId = "123e4567-e89b-12d3-a456-426614174000";

  beforeEach(async () => {
    roomTypeRepository = {
      findById: jest.fn(),
      save: jest.fn(),
      saveHotelRoom: jest.fn(),
    };

    const mockEventBus = {
      publish: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateHotelRoomHandler,
        {
          provide: ROOM_TYPE_REPOSITORY,
          useValue: roomTypeRepository,
        },
        {
          provide: EventBus,
          useValue: mockEventBus,
        },
      ],
    }).compile();

    handler = module.get<CreateHotelRoomHandler>(CreateHotelRoomHandler);
    eventBus = module.get(EventBus);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(handler).toBeDefined();
  });

  it("should create hotel room successfully", async () => {
    const mockRoomType = {
      getId: jest.fn().mockReturnValue({
        getValue: jest.fn().mockReturnValue(mockRoomTypeId),
      }),
      createHotelRoom: jest.fn().mockReturnValue({
        getId: jest.fn().mockReturnValue({
          getValue: jest.fn().mockReturnValue("hotel-room-id"),
        }),
        getRoomTypeId: jest.fn().mockReturnValue({
          getValue: jest.fn().mockReturnValue(mockRoomTypeId),
        }),
        getRoomNumber: jest.fn().mockReturnValue({
          getValue: jest.fn().mockReturnValue("101"),
        }),
        getFloorId: jest.fn().mockReturnValue("floor-1"),
        getStatus: jest.fn().mockReturnValue({
          value: jest.fn().mockReturnValue(HotelRoomStatus.AVAILABLE),
        }),
        getNotes: jest.fn().mockReturnValue("Corner room"),
      }),
      pullDomainEvents: jest
        .fn()
        .mockReturnValue([{ type: "HotelRoomCreated" }]),
    };

    roomTypeRepository.findById.mockResolvedValue(mockRoomType);

    const command = new CreateHotelRoomCommand(
      mockRoomTypeId,
      "101",
      "floor-1",
      "Corner room",
    );

    const result = await handler.execute(command);

    expect(roomTypeRepository.findById).toHaveBeenCalled();
    expect(mockRoomType.createHotelRoom).toHaveBeenCalled();
    expect(roomTypeRepository.save).toHaveBeenCalledWith(mockRoomType);
    expect(roomTypeRepository.saveHotelRoom).toHaveBeenCalled();
    // eventBus.publish is called if domain events exist
    expect(eventBus.publish).toHaveBeenCalled();
    expect(result).toEqual({
      id: "hotel-room-id",
      roomTypeId: mockRoomTypeId,
      roomNumber: "101",
      floorId: "floor-1",
      status: HotelRoomStatus.AVAILABLE,
      notes: "Corner room",
    });
  });

  it("should create hotel room without floorId and notes", async () => {
    const mockRoomType = {
      getId: jest.fn().mockReturnValue({
        getValue: jest.fn().mockReturnValue(mockRoomTypeId),
      }),
      createHotelRoom: jest.fn().mockReturnValue({
        getId: jest.fn().mockReturnValue({
          getValue: jest.fn().mockReturnValue("hotel-room-id"),
        }),
        getRoomTypeId: jest.fn().mockReturnValue({
          getValue: jest.fn().mockReturnValue(mockRoomTypeId),
        }),
        getRoomNumber: jest.fn().mockReturnValue({
          getValue: jest.fn().mockReturnValue("102"),
        }),
        getFloorId: jest.fn().mockReturnValue(undefined),
        getStatus: jest.fn().mockReturnValue({
          value: jest.fn().mockReturnValue(HotelRoomStatus.AVAILABLE),
        }),
        getNotes: jest.fn().mockReturnValue(undefined),
      }),
      pullDomainEvents: jest.fn().mockReturnValue([]),
    };

    roomTypeRepository.findById.mockResolvedValue(mockRoomType);

    const command = new CreateHotelRoomCommand(mockRoomTypeId, "102");

    const result = await handler.execute(command);

    expect(mockRoomType.createHotelRoom).toHaveBeenCalled();
    expect(result.floorId).toBeUndefined();
    expect(result.notes).toBeUndefined();
  });

  it("should throw NotFoundError if room type does not exist", async () => {
    roomTypeRepository.findById.mockResolvedValue(null);

    const command = new CreateHotelRoomCommand(mockRoomTypeId, "101");

    await expect(handler.execute(command)).rejects.toThrow(NotFoundError);
    expect(roomTypeRepository.findById).toHaveBeenCalled();
    expect(roomTypeRepository.save).not.toHaveBeenCalled();
  });

  it("should publish domain events", async () => {
    const mockDomainEvent = { type: "RoomTypeCreated" };
    const mockRoomType = {
      getId: jest.fn().mockReturnValue({
        getValue: jest.fn().mockReturnValue(mockRoomTypeId),
      }),
      createHotelRoom: jest.fn().mockReturnValue({
        getId: jest.fn().mockReturnValue({
          getValue: jest.fn().mockReturnValue("hotel-room-id"),
        }),
        getRoomTypeId: jest.fn().mockReturnValue({
          getValue: jest.fn().mockReturnValue(mockRoomTypeId),
        }),
        getRoomNumber: jest.fn().mockReturnValue({
          getValue: jest.fn().mockReturnValue("101"),
        }),
        getFloorId: jest.fn().mockReturnValue(undefined),
        getStatus: jest.fn().mockReturnValue({
          value: jest.fn().mockReturnValue(HotelRoomStatus.AVAILABLE),
        }),
        getNotes: jest.fn().mockReturnValue(undefined),
      }),
      pullDomainEvents: jest.fn().mockReturnValue([mockDomainEvent]),
    };

    roomTypeRepository.findById.mockResolvedValue(mockRoomType);

    const command = new CreateHotelRoomCommand(mockRoomTypeId, "101");

    await handler.execute(command);

    expect(eventBus.publish).toHaveBeenCalledWith(mockDomainEvent);
  });
});
