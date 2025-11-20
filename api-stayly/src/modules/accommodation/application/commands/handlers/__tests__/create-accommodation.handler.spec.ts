import { Test, TestingModule } from "@nestjs/testing";
import { EventBus } from "@nestjs/cqrs";
import { CreateAccommodationHandler } from "../create-accommodation.handler";
import { CreateAccommodationCommand } from "../../create-accommodation.command";
import { AccommodationType } from "../../../../domain/entities/accommodation.entity";
import { ACCOMMODATION_REPOSITORY } from "../../../../domain/repositories/accommodation.repository.interface";
import { AccommodationDtoMapper } from "../../../../infrastructure/persistence/mappers/accommodation-dto.mapper";
import { AccommodationStatus } from "../../../../domain/value-objects/accommodation-status.vo";

describe("CreateAccommodationHandler", () => {
  let handler: CreateAccommodationHandler;
  let accommodationRepo: { save: jest.Mock };
  let eventBus: { publish: jest.Mock };
  let dtoMapper: { toDto: jest.Mock };

  const mockAccommodationRepo = {
    save: jest.fn(),
  };

  const mockEventBus = {
    publish: jest.fn(),
  };

  const mockDtoMapper = {
    toDto: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateAccommodationHandler,
        {
          provide: ACCOMMODATION_REPOSITORY,
          useValue: mockAccommodationRepo,
        },
        {
          provide: EventBus,
          useValue: mockEventBus,
        },
        {
          provide: AccommodationDtoMapper,
          useValue: mockDtoMapper,
        },
      ],
    }).compile();

    handler = module.get<CreateAccommodationHandler>(
      CreateAccommodationHandler,
    );
    accommodationRepo = module.get(ACCOMMODATION_REPOSITORY);
    eventBus = module.get(EventBus);
    dtoMapper = module.get(AccommodationDtoMapper);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(handler).toBeDefined();
  });

  it("should create accommodation successfully", async () => {
    const command = new CreateAccommodationCommand(
      AccommodationType.HOMESTAY,
      "Cozy Homestay",
      "owner-123",
      {
        street: "123 Main St",
        ward: "Ward 1",
        district: "District 1",
        province: "HCMC",
        country: "Vietnam",
      },
      {
        latitude: 10.762622,
        longitude: 106.660172,
      },
      "A nice place",
      ["image1.jpg", "image2.jpg", "image3.jpg"],
      ["Wifi"],
      {
        checkInTime: "14:00",
        checkOutTime: "12:00",
        childrenAllowed: true,
        petsAllowed: false,
        smokingAllowed: false,
      },
      {
        type: "flexible",
        freeCancellationDays: 1,
        refundPercentage: 100,
      },
    );

    const expectedDto = {
      id: "some-id",
      name: "Cozy Homestay",
      status: AccommodationStatus.ACTIVE,
    };

    mockDtoMapper.toDto.mockReturnValue(expectedDto);

    const result = await handler.execute(command);

    expect(accommodationRepo.save).toHaveBeenCalled();
    expect(eventBus.publish).toHaveBeenCalled();
    expect(dtoMapper.toDto).toHaveBeenCalled();
    expect(result).toEqual(expectedDto);
  });
});
