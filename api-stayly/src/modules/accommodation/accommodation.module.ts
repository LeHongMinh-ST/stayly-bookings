/**
 * Accommodation Management Module
 * Provides accommodation (homestay/hotel) management capabilities
 */

import { Module } from "@nestjs/common";
import { CqrsModule } from "@nestjs/cqrs";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AccommodationsController } from "./presentation/controllers/accommodations.controller";
import { CreateAccommodationHandler } from "./application/commands/handlers/create-accommodation.handler";
import { GetAccommodationHandler } from "./application/queries/handlers/get-accommodation.handler";
import { ListAccommodationsHandler } from "./application/queries/handlers/list-accommodations.handler";
import { ACCOMMODATION_REPOSITORY } from "./domain/repositories/accommodation.repository.interface";
import { AccommodationRepository } from "./infrastructure/persistence/repositories/accommodation.repository";
import { AccommodationOrmEntity } from "./infrastructure/persistence/entities/accommodation.orm-entity";
import { AccommodationMapper } from "./infrastructure/persistence/mappers/accommodation.mapper";
import { AccommodationDtoMapper } from "./infrastructure/persistence/mappers/accommodation-dto.mapper";
import { AccommodationStatusService } from "./domain/services/accommodation-status.service";
import { FloorManagementService } from "./domain/services/floor-management.service";
import { RbacModule } from "../rbac/rbac.module";
import { USER_AUTHORIZATION_SERVICE } from "./infrastructure/services/user-authorization.service";
import { ACCOMMODATION_BOOKING_POLICY_SERVICE } from "./infrastructure/services/accommodation-booking-policy.service";
import { UpdateAccommodationHandler } from "./application/commands/handlers/update-accommodation.handler";
import { DeleteAccommodationHandler } from "./application/commands/handlers/delete-accommodation.handler";

const commandHandlers = [
  CreateAccommodationHandler,
  UpdateAccommodationHandler,
  DeleteAccommodationHandler,
];

const queryHandlers = [GetAccommodationHandler, ListAccommodationsHandler];

@Module({
  imports: [
    CqrsModule,
    TypeOrmModule.forFeature([AccommodationOrmEntity]),
    RbacModule,
  ],
  controllers: [AccommodationsController],
  providers: [
    ...commandHandlers,
    ...queryHandlers,
    { provide: ACCOMMODATION_REPOSITORY, useClass: AccommodationRepository },
    AccommodationMapper,
    AccommodationDtoMapper,
    AccommodationStatusService,
    FloorManagementService,
    USER_AUTHORIZATION_SERVICE,
    ACCOMMODATION_BOOKING_POLICY_SERVICE,
  ],
  exports: [ACCOMMODATION_REPOSITORY],
})
export class AccommodationModule {}
