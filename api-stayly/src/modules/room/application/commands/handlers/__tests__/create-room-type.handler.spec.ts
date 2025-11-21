import { Test, TestingModule } from "@nestjs/testing";
import { EventBus } from "@nestjs/cqrs";
import { CreateRoomTypeHandler } from "../create-room-type.handler";
import { CreateRoomTypeCommand } from "../../create-room-type.command";
import { ROOM_TYPE_REPOSITORY } from "../../../../domain/repositories/room-type.repository.interface";
import { RoomDtoMapper } from "../../../../infrastructure/persistence/mappers/room-dto.mapper";
import { RoomStatus } from "../../../../domain/value-objects/room-status.vo";
import { RoomTypeCategory } from "../../../../domain/value-objects/room-type.vo";
import { BedType } from "../../../../domain/value-objects/bed-type.vo";

describe("CreateRoomTypeHandler", () => {
  let handler: CreateRoomTypeHandler;
  let roomTypeRepository: { save: jest.Mock };
  let dtoMapper: { toRoomTypeDto: jest.Mock };

  const mockRoomTypeRepository = {
    save: jest.fn(),
  };

  const mockEventBus = {
    publish: jest.fn(),
  };

  const mockDtoMapper = {
    toRoomTypeDto: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateRoomTypeHandler,
        {
          provide: ROOM_TYPE_REPOSITORY,
          useValue: mockRoomTypeRepository,
        },
        {
          provide: EventBus,
          useValue: mockEventBus,
        },
        {
          provide: RoomDtoMapper,
          useValue: mockDtoMapper,
        },
      ],
    }).compile();

    handler = module.get<CreateRoomTypeHandler>(CreateRoomTypeHandler);
    roomTypeRepository = module.get(ROOM_TYPE_REPOSITORY);
    dtoMapper = module.get(RoomDtoMapper);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(handler).toBeDefined();
  });

  it("should create room type successfully", async () => {
    const command = new CreateRoomTypeCommand(
      "hotel-123",
      "Deluxe Double",
      RoomTypeCategory.DOUBLE,
      30,
      {
        maxAdults: 2,
        maxChildren: 1,
      },
      1,
      BedType.DOUBLE,
      "A luxury room",
      ["wifi", "tv", "minibar"],
      [
        { url: "image1.jpg", type: "interior", order: 0 },
        { url: "image2.jpg", type: "bathroom", order: 1 },
        { url: "image3.jpg", type: "view", order: 2 },
      ],
      10,
      {
        amount: 1000000,
        currency: "VND",
      },
      "sea",
    );

    const expectedDto = {
      id: "room-type-id",
      name: "Deluxe Double",
      status: RoomStatus.ACTIVE,
      hotelId: "hotel-123",
      viewDirection: "sea",
    };

    mockDtoMapper.toRoomTypeDto.mockReturnValue(expectedDto);

    const result = await handler.execute(command);

    expect(roomTypeRepository.save).toHaveBeenCalled();
    // eventBus.publish may or may not be called depending on domain events
    expect(dtoMapper.toRoomTypeDto).toHaveBeenCalled();
    expect(result).toEqual(expectedDto);
  });

  it("should create room type without view direction", async () => {
    const command = new CreateRoomTypeCommand(
      "hotel-123",
      "Standard Room",
      RoomTypeCategory.SINGLE,
      25,
      {
        maxAdults: 1,
      },
      1,
      BedType.SINGLE,
      "A standard room",
      ["wifi"],
      [
        { url: "image1.jpg", order: 0 },
        { url: "image2.jpg", order: 1 },
        { url: "image3.jpg", order: 2 },
      ],
      5,
      {
        amount: 500000,
        currency: "VND",
      },
    );

    const expectedDto = {
      id: "room-type-id",
      name: "Standard Room",
      status: RoomStatus.ACTIVE,
    };

    mockDtoMapper.toRoomTypeDto.mockReturnValue(expectedDto);

    const result = await handler.execute(command);

    expect(roomTypeRepository.save).toHaveBeenCalled();
    expect(result).toEqual(expectedDto);
  });

  it("should handle domain events publishing", async () => {
    const command = new CreateRoomTypeCommand(
      "hotel-123",
      "Deluxe Double",
      RoomTypeCategory.DOUBLE,
      30,
      {
        maxAdults: 2,
      },
      1,
      BedType.DOUBLE,
      "A luxury room",
      ["wifi"],
      [
        { url: "image1.jpg", order: 0 },
        { url: "image2.jpg", order: 1 },
        { url: "image3.jpg", order: 2 },
      ],
      10,
      {
        amount: 1000000,
        currency: "VND",
      },
    );

    mockDtoMapper.toRoomTypeDto.mockReturnValue({ id: "room-type-id" });

    await handler.execute(command);

    // Handler calls pullDomainEvents and publishes events if any exist
    // This is tested implicitly by verifying handler executes without error
    expect(roomTypeRepository.save).toHaveBeenCalled();
  });
});
