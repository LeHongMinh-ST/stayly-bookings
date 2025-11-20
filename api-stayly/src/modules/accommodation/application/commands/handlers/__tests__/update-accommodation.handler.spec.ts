import { Test, TestingModule } from "@nestjs/testing";
import { EventBus } from "@nestjs/cqrs";
import { NotFoundException, ForbiddenException } from "@nestjs/common";
import { UpdateAccommodationHandler } from "../update-accommodation.handler";
import { UpdateAccommodationCommand } from "../../update-accommodation.command";
import { ACCOMMODATION_REPOSITORY } from "../../../../domain/repositories/accommodation.repository.interface";
import { AccommodationDtoMapper } from "../../../../infrastructure/persistence/mappers/accommodation-dto.mapper";
import { USER_AUTHORIZATION_PORT } from "../../../interfaces/user-authorization.port";

describe("UpdateAccommodationHandler", () => {
  let handler: UpdateAccommodationHandler;
  let accommodationRepo: { findById: jest.Mock; save: jest.Mock };
  let eventBus: { publish: jest.Mock };
  let dtoMapper: { toDto: jest.Mock };
  let userAuthorizationPort: { isSuperAdmin: jest.Mock };

  const mockAccommodationId = "123e4567-e89b-12d3-a456-426614174000";
  const mockOwnerId = "owner-123";

  beforeEach(async () => {
    accommodationRepo = {
      findById: jest.fn(),
      save: jest.fn(),
    };

    eventBus = {
      publish: jest.fn(),
    };

    dtoMapper = {
      toDto: jest.fn(),
    };

    userAuthorizationPort = {
      isSuperAdmin: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateAccommodationHandler,
        {
          provide: ACCOMMODATION_REPOSITORY,
          useValue: accommodationRepo,
        },
        {
          provide: EventBus,
          useValue: eventBus,
        },
        {
          provide: AccommodationDtoMapper,
          useValue: dtoMapper,
        },
        {
          provide: USER_AUTHORIZATION_PORT,
          useValue: userAuthorizationPort,
        },
      ],
    }).compile();

    handler = module.get<UpdateAccommodationHandler>(
      UpdateAccommodationHandler,
    );
  });

  it("should be defined", () => {
    expect(handler).toBeDefined();
  });

  it("should throw NotFoundException if accommodation not found", async () => {
    accommodationRepo.findById.mockResolvedValue(null);

    userAuthorizationPort.isSuperAdmin.mockResolvedValue(false);

    const command = new UpdateAccommodationCommand(
      mockAccommodationId,
      mockOwnerId,
      "New Name",
    );

    await expect(handler.execute(command)).rejects.toThrow(NotFoundException);
  });

  it("should throw ForbiddenException if ownerId does not match", async () => {
    const mockAccommodation = {
      getOwnerId: jest.fn().mockReturnValue("other-owner"),
    };
    accommodationRepo.findById.mockResolvedValue(mockAccommodation);

    userAuthorizationPort.isSuperAdmin.mockResolvedValue(false);

    const command = new UpdateAccommodationCommand(
      mockAccommodationId,
      mockOwnerId,
      "New Name",
    );

    await expect(handler.execute(command)).rejects.toThrow(ForbiddenException);
  });

  it("should update accommodation and save", async () => {
    const mockAccommodation = {
      getOwnerId: jest.fn().mockReturnValue(mockOwnerId),
      update: jest.fn(),
      pullDomainEvents: jest.fn().mockReturnValue([]),
    };
    accommodationRepo.findById.mockResolvedValue(mockAccommodation);
    dtoMapper.toDto.mockReturnValue({ id: mockAccommodationId });

    userAuthorizationPort.isSuperAdmin.mockResolvedValue(false);

    const command = new UpdateAccommodationCommand(
      mockAccommodationId,
      mockOwnerId,
      "New Name",
      "New Description",
    );

    await handler.execute(command);

    expect(mockAccommodation.update).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "New Name",
        description: "New Description",
      }),
    );
    expect(accommodationRepo.save).toHaveBeenCalledWith(mockAccommodation);
    expect(dtoMapper.toDto).toHaveBeenCalledWith(mockAccommodation);
  });

  it("should allow super admin to update without ownership", async () => {
    const mockAccommodation = {
      getOwnerId: jest.fn().mockReturnValue("different-owner"),
      update: jest.fn(),
      pullDomainEvents: jest.fn().mockReturnValue([]),
    };
    accommodationRepo.findById.mockResolvedValue(mockAccommodation);
    dtoMapper.toDto.mockReturnValue({ id: mockAccommodationId });

    const command = new UpdateAccommodationCommand(
      mockAccommodationId,
      mockOwnerId,
    );

    userAuthorizationPort.isSuperAdmin.mockResolvedValue(true);

    await handler.execute(command);

    expect(accommodationRepo.save).toHaveBeenCalledWith(mockAccommodation);
    expect(dtoMapper.toDto).toHaveBeenCalledWith(mockAccommodation);
  });
});
