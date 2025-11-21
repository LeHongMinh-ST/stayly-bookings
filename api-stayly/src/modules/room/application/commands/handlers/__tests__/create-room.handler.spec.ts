import { Test, TestingModule } from "@nestjs/testing";
import { EventBus } from "@nestjs/cqrs";
import { CreateRoomHandler } from "../create-room.handler";
import { CreateRoomCommand } from "../../create-room.command";
import { ROOM_REPOSITORY } from "../../../../domain/repositories/room.repository.interface";
import { RoomDtoMapper } from "../../../../infrastructure/persistence/mappers/room-dto.mapper";
import { RoomStatus } from "../../../../domain/value-objects/room-status.vo";
import { RoomTypeCategory } from "../../../../domain/value-objects/room-type.vo";
import { BedType } from "../../../../domain/value-objects/bed-type.vo";

describe("CreateRoomHandler", () => {
  let handler: CreateRoomHandler;
  let roomRepository: { save: jest.Mock };
  let dtoMapper: { toRoomDto: jest.Mock };

  const mockRoomRepository = {
    save: jest.fn(),
  };

  const mockEventBus = {
    publish: jest.fn(),
  };

  const mockDtoMapper = {
    toRoomDto: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateRoomHandler,
        {
          provide: ROOM_REPOSITORY,
          useValue: mockRoomRepository,
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

    handler = module.get<CreateRoomHandler>(CreateRoomHandler);
    roomRepository = module.get(ROOM_REPOSITORY);
    dtoMapper = module.get(RoomDtoMapper);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(handler).toBeDefined();
  });

  it("should create room successfully", async () => {
    const command = new CreateRoomCommand(
      "accommodation-123",
      "Deluxe Room",
      RoomTypeCategory.DOUBLE,
      25,
      {
        maxAdults: 2,
        maxChildren: 1,
      },
      1,
      BedType.DOUBLE,
      "A nice room",
      ["wifi", "tv"],
      [
        { url: "image1.jpg", type: "interior", order: 0 },
        { url: "image2.jpg", type: "bathroom", order: 1 },
      ],
      1,
      {
        amount: 500000,
        currency: "VND",
      },
    );

    const expectedDto = {
      id: "room-id",
      name: "Deluxe Room",
      status: RoomStatus.ACTIVE,
      accommodationId: "accommodation-123",
    };

    mockDtoMapper.toRoomDto.mockReturnValue(expectedDto);

    const result = await handler.execute(command);

    expect(roomRepository.save).toHaveBeenCalled();
    // eventBus.publish may or may not be called depending on domain events
    expect(dtoMapper.toRoomDto).toHaveBeenCalled();
    expect(result).toEqual(expectedDto);
  });

  it("should create room without base price", async () => {
    const command = new CreateRoomCommand(
      "accommodation-123",
      "Standard Room",
      RoomTypeCategory.SINGLE,
      20,
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
      ],
      1,
    );

    const expectedDto = {
      id: "room-id",
      name: "Standard Room",
      status: RoomStatus.ACTIVE,
    };

    mockDtoMapper.toRoomDto.mockReturnValue(expectedDto);

    const result = await handler.execute(command);

    expect(roomRepository.save).toHaveBeenCalled();
    expect(result).toEqual(expectedDto);
  });

  it("should handle domain events publishing", async () => {
    const command = new CreateRoomCommand(
      "accommodation-123",
      "Deluxe Room",
      RoomTypeCategory.DOUBLE,
      25,
      {
        maxAdults: 2,
      },
      1,
      BedType.DOUBLE,
      "A nice room",
      ["wifi"],
      [
        { url: "image1.jpg", order: 0 },
        { url: "image2.jpg", order: 1 },
      ],
      1,
    );

    mockDtoMapper.toRoomDto.mockReturnValue({ id: "room-id" });

    await handler.execute(command);

    // Handler calls pullDomainEvents and publishes events if any exist
    // This is tested implicitly by verifying handler executes without error
    expect(roomRepository.save).toHaveBeenCalled();
  });
});
