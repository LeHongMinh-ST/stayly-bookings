import { Test, TestingModule } from "@nestjs/testing";
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from "@nestjs/common";
import { DeleteAccommodationHandler } from "../delete-accommodation.handler";
import { DeleteAccommodationCommand } from "../../delete-accommodation.command";
import { ACCOMMODATION_REPOSITORY } from "../../../../domain/repositories/accommodation.repository.interface";
import { USER_AUTHORIZATION_PORT } from "../../../interfaces/user-authorization.port";
import { ACCOMMODATION_BOOKING_POLICY_PORT } from "../../../interfaces/accommodation-booking-policy.port";

describe("DeleteAccommodationHandler", () => {
  let handler: DeleteAccommodationHandler;
  let accommodationRepo: {
    findById: jest.Mock;
    delete: jest.Mock;
  };
  let userAuthorizationPort: { isSuperAdmin: jest.Mock };
  let bookingPolicyPort: { hasUpcomingBookings: jest.Mock };

  const mockAccommodationId = "123e4567-e89b-12d3-a456-426614174000";
  const mockOwnerId = "owner-123";

  beforeEach(async () => {
    accommodationRepo = {
      findById: jest.fn(),
      delete: jest.fn(),
    };

    userAuthorizationPort = {
      isSuperAdmin: jest.fn(),
    };

    bookingPolicyPort = {
      hasUpcomingBookings: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteAccommodationHandler,
        {
          provide: ACCOMMODATION_REPOSITORY,
          useValue: accommodationRepo,
        },
        {
          provide: USER_AUTHORIZATION_PORT,
          useValue: userAuthorizationPort,
        },
        {
          provide: ACCOMMODATION_BOOKING_POLICY_PORT,
          useValue: bookingPolicyPort,
        },
      ],
    }).compile();

    handler = module.get<DeleteAccommodationHandler>(
      DeleteAccommodationHandler,
    );
  });

  it("should be defined", () => {
    expect(handler).toBeDefined();
  });

  it("should throw NotFoundException when accommodation does not exist", async () => {
    accommodationRepo.findById.mockResolvedValue(null);
    userAuthorizationPort.isSuperAdmin.mockResolvedValue(false);

    const command = new DeleteAccommodationCommand(
      mockAccommodationId,
      mockOwnerId,
    );

    await expect(handler.execute(command)).rejects.toThrow(NotFoundException);
  });

  it("should throw ForbiddenException when user is neither owner nor super admin", async () => {
    const mockAccommodation = {
      getOwnerId: jest.fn().mockReturnValue("other-owner"),
      canBeDeleted: jest.fn().mockReturnValue(true),
    };
    accommodationRepo.findById.mockResolvedValue(mockAccommodation);
    userAuthorizationPort.isSuperAdmin.mockResolvedValue(false);

    const command = new DeleteAccommodationCommand(
      mockAccommodationId,
      mockOwnerId,
    );

    await expect(handler.execute(command)).rejects.toThrow(ForbiddenException);
  });

  it("should throw BadRequestException when accommodation cannot be deleted due to status", async () => {
    const mockAccommodation = {
      getOwnerId: jest.fn().mockReturnValue(mockOwnerId),
      canBeDeleted: jest.fn().mockReturnValue(false),
    };
    accommodationRepo.findById.mockResolvedValue(mockAccommodation);
    userAuthorizationPort.isSuperAdmin.mockResolvedValue(false);

    const command = new DeleteAccommodationCommand(
      mockAccommodationId,
      mockOwnerId,
    );

    await expect(handler.execute(command)).rejects.toThrow(BadRequestException);
  });

  it("should throw BadRequestException when upcoming bookings exist", async () => {
    const mockAccommodation = {
      getOwnerId: jest.fn().mockReturnValue(mockOwnerId),
      canBeDeleted: jest.fn().mockReturnValue(true),
    };
    accommodationRepo.findById.mockResolvedValue(mockAccommodation);
    userAuthorizationPort.isSuperAdmin.mockResolvedValue(false);
    bookingPolicyPort.hasUpcomingBookings.mockResolvedValue(true);

    const command = new DeleteAccommodationCommand(
      mockAccommodationId,
      mockOwnerId,
    );

    await expect(handler.execute(command)).rejects.toThrow(BadRequestException);
  });

  it("should delete accommodation when checks pass", async () => {
    const mockAccommodationIdVo = {
      getValue: () => mockAccommodationId,
    };
    const mockAccommodation = {
      getOwnerId: jest.fn().mockReturnValue(mockOwnerId),
      canBeDeleted: jest.fn().mockReturnValue(true),
      getId: jest.fn().mockReturnValue(mockAccommodationIdVo),
    };

    accommodationRepo.findById.mockResolvedValue(mockAccommodation);
    userAuthorizationPort.isSuperAdmin.mockResolvedValue(false);
    bookingPolicyPort.hasUpcomingBookings.mockResolvedValue(false);

    const command = new DeleteAccommodationCommand(
      mockAccommodationId,
      mockOwnerId,
    );

    await handler.execute(command);

    expect(accommodationRepo.delete).toHaveBeenCalled();
  });

  it("should allow super admin to delete accommodation regardless of ownership", async () => {
    const mockAccommodation = {
      getOwnerId: jest.fn().mockReturnValue("different-owner"),
      canBeDeleted: jest.fn().mockReturnValue(true),
      getId: jest.fn().mockReturnValue({ getValue: () => mockAccommodationId }),
    };

    accommodationRepo.findById.mockResolvedValue(mockAccommodation);
    userAuthorizationPort.isSuperAdmin.mockResolvedValue(true);
    bookingPolicyPort.hasUpcomingBookings.mockResolvedValue(false);

    const command = new DeleteAccommodationCommand(
      mockAccommodationId,
      mockOwnerId,
    );

    await handler.execute(command);

    expect(accommodationRepo.delete).toHaveBeenCalled();
  });
});
