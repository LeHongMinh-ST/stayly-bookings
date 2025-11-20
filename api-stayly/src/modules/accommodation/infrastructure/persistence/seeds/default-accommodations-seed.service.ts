/**
 * DefaultAccommodationsSeedService populates sample accommodations for demo/testing
 */
import { Inject, Injectable, Logger } from "@nestjs/common";
import { ModuleRef } from "@nestjs/core";
import { ConfigService } from "@nestjs/config";
import { Address } from "../../../domain/value-objects/address.vo";
import { Location } from "../../../domain/value-objects/location.vo";
import { Policies } from "../../../domain/value-objects/policies.vo";
import {
  CancellationPolicy,
  CancellationPolicyType,
} from "../../../domain/value-objects/cancellation-policy.vo";
import {
  Accommodation,
  AccommodationType,
} from "../../../domain/entities/accommodation.entity";
import type { IAccommodationRepository } from "../../../domain/repositories/accommodation.repository.interface";
import { ACCOMMODATION_REPOSITORY } from "../../../domain/repositories/accommodation.repository.interface";
import type { IUserRepository } from "../../../../user/domain/repositories/user.repository.interface";
import { USER_REPOSITORY } from "../../../../user/domain/repositories/user.repository.interface";
import { Email } from "../../../../../common/domain/value-objects/email.vo";

interface AccommodationSeedDefinition {
  type: AccommodationType;
  name: string;
  description: string;
  images: string[];
  amenities: string[];
  address: {
    street: string;
    ward: string;
    district: string;
    province: string;
    country: string;
  };
  location: {
    latitude: number;
    longitude: number;
  };
  policies: {
    checkInTime: string;
    checkOutTime: string;
    childrenAllowed: boolean;
    petsAllowed: boolean;
    smokingAllowed: boolean;
  };
  cancellationPolicy: {
    type: CancellationPolicyType;
    freeCancellationDays: number;
    refundPercentage: number;
  };
  starRating?: number;
}

const DEFAULT_ACCOMMODATIONS: AccommodationSeedDefinition[] = [
  {
    type: AccommodationType.HOMESTAY,
    name: "Saigon Riverside Loft",
    description:
      "Boutique riverside homestay in District 2 with panoramic views, curated local art, and private rooftop lounge.",
    images: [
      "https://images.stayly.dev/homestay/saigon-loft-1.jpg",
      "https://images.stayly.dev/homestay/saigon-loft-2.jpg",
      "https://images.stayly.dev/homestay/saigon-loft-3.jpg",
      "https://images.stayly.dev/homestay/saigon-loft-4.jpg",
    ],
    amenities: [
      "Rooftop lounge",
      "Complimentary breakfast",
      "Fiber internet",
      "City bicycle rental",
      "Airport shuttle",
    ],
    address: {
      street: "45 Nguyen Van Huong",
      ward: "Thao Dien",
      district: "District 2",
      province: "Ho Chi Minh City",
      country: "Vietnam",
    },
    location: {
      latitude: 10.81045,
      longitude: 106.73015,
    },
    policies: {
      checkInTime: "14:00",
      checkOutTime: "11:00",
      childrenAllowed: true,
      petsAllowed: false,
      smokingAllowed: false,
    },
    cancellationPolicy: {
      type: CancellationPolicyType.FLEXIBLE,
      freeCancellationDays: 3,
      refundPercentage: 100,
    },
  },
  {
    type: AccommodationType.HOTEL,
    name: "Azure Sky Hotel & Spa",
    description:
      "Five-star beachfront sanctuary in Da Nang featuring skyline infinity pool, holistic spa, and Michelin-inspired dining.",
    images: [
      "https://images.stayly.dev/hotel/azure-sky-1.jpg",
      "https://images.stayly.dev/hotel/azure-sky-2.jpg",
      "https://images.stayly.dev/hotel/azure-sky-3.jpg",
      "https://images.stayly.dev/hotel/azure-sky-4.jpg",
      "https://images.stayly.dev/hotel/azure-sky-5.jpg",
    ],
    amenities: [
      "Oceanfront infinity pool",
      "Full-service spa",
      "24/7 concierge",
      "Executive lounge",
      "Airport limousine",
      "Kids club",
    ],
    address: {
      street: "88 Vo Nguyen Giap",
      ward: "My An",
      district: "Ngu Hanh Son",
      province: "Da Nang",
      country: "Vietnam",
    },
    location: {
      latitude: 16.04922,
      longitude: 108.24704,
    },
    policies: {
      checkInTime: "15:00",
      checkOutTime: "12:00",
      childrenAllowed: true,
      petsAllowed: false,
      smokingAllowed: false,
    },
    cancellationPolicy: {
      type: CancellationPolicyType.MODERATE,
      freeCancellationDays: 7,
      refundPercentage: 50,
    },
    starRating: 5,
  },
];

@Injectable()
export class DefaultAccommodationsSeedService {
  private readonly logger = new Logger(DefaultAccommodationsSeedService.name);

  constructor(
    @Inject(ACCOMMODATION_REPOSITORY)
    private readonly accommodationRepository: IAccommodationRepository,
    private readonly moduleRef: ModuleRef,
    private readonly configService: ConfigService,
  ) {}

  async seed(): Promise<void> {
    const existingCount = await this.accommodationRepository.count();
    if (existingCount > 0) {
      this.logger.log("Accommodations already exist. Skipping seeding.");
      return;
    }

    const ownerEmail =
      this.configService.get<string>("seeds.superAdminEmail") ??
      "admin@stayly.dev";

    const userRepository = this.moduleRef.get<IUserRepository>(
      USER_REPOSITORY,
      { strict: false },
    );

    const owner = await userRepository.findByEmail(Email.create(ownerEmail));
    if (!owner) {
      this.logger.warn(
        `Owner with email ${ownerEmail} not found. Skipping accommodation seeding.`,
      );
      return;
    }

    const ownerId = owner.getId().getValue();

    for (const fixture of DEFAULT_ACCOMMODATIONS) {
      const address = Address.create(fixture.address);
      const location = Location.create(
        fixture.location.latitude,
        fixture.location.longitude,
      );
      const policies = Policies.create(fixture.policies);
      const cancellationPolicy = CancellationPolicy.create(
        fixture.cancellationPolicy,
      );

      const accommodation = Accommodation.create({
        type: fixture.type,
        name: fixture.name,
        ownerId,
        address,
        location,
        description: fixture.description,
        images: fixture.images,
        amenities: fixture.amenities,
        policies,
        cancellationPolicy,
        starRating: fixture.starRating,
      });

      await this.accommodationRepository.save(accommodation);
    }

    this.logger.log(
      `Seeded ${DEFAULT_ACCOMMODATIONS.length} sample accommodations owned by ${ownerEmail}`,
    );
  }
}
