/**
 * RoomsController
 * REST API endpoints for room management (homestay and hotel)
 */

import {
  Controller,
  Post,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from "@nestjs/swagger";
import { CommandBus } from "@nestjs/cqrs";
import { JwtUserGuard } from "../../../../common/guards/jwt-user.guard";
import { Permissions } from "../../../../common/decorators/permissions.decorator";
import { CreateRoomCommand } from "../../application/commands/create-room.command";
import { CreateRoomTypeCommand } from "../../application/commands/create-room-type.command";
import { CreateHotelRoomCommand } from "../../application/commands/create-hotel-room.command";
import { CreateRoomDto } from "../../application/dto/request/create-room.dto";
import { CreateRoomTypeDto } from "../../application/dto/request/create-room-type.dto";
import { CreateHotelRoomDto } from "../../application/dto/request/create-hotel-room.dto";
import { RoomResponseDto } from "../../application/dto/response/room-response.dto";
import { RoomTypeResponseDto } from "../../application/dto/response/room-type-response.dto";
import { HotelRoomResponseDto } from "../../application/dto/response/hotel-room-response.dto";

@Controller("v1/rooms")
@ApiTags("rooms")
@UseGuards(JwtUserGuard)
@ApiBearerAuth("JWT-auth")
export class RoomsController {
  constructor(private readonly commandBus: CommandBus) {}

  /**
   * Create a new room for homestay accommodation
   */
  @Post("homestay")
  @Permissions("homestay:create", "homestay:manage")
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Create a new homestay room" })
  @ApiResponse({
    status: 201,
    description: "Room created successfully",
    type: RoomResponseDto,
  })
  @ApiResponse({ status: 400, description: "Bad request - validation failed" })
  @ApiResponse({
    status: 403,
    description: "Forbidden - insufficient permissions",
  })
  async createHomestayRoom(
    @Body() dto: CreateRoomDto,
  ): Promise<RoomResponseDto> {
    const command = new CreateRoomCommand(
      dto.accommodationId,
      dto.name,
      dto.category,
      dto.area,
      dto.guestCapacity,
      dto.bedCount,
      dto.bedType,
      dto.description,
      dto.amenities,
      dto.images,
      dto.inventory,
      dto.basePrice,
    );

    return this.commandBus.execute(command);
  }

  /**
   * Create a new room type for hotel accommodation
   */
  @Post("hotel/room-types")
  @Permissions("hotel:create", "hotel:manage")
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Create a new hotel room type" })
  @ApiResponse({
    status: 201,
    description: "Room type created successfully",
    type: RoomTypeResponseDto,
  })
  @ApiResponse({ status: 400, description: "Bad request - validation failed" })
  @ApiResponse({
    status: 403,
    description: "Forbidden - insufficient permissions",
  })
  async createRoomType(
    @Body() dto: CreateRoomTypeDto,
  ): Promise<RoomTypeResponseDto> {
    const command = new CreateRoomTypeCommand(
      dto.hotelId,
      dto.name,
      dto.category,
      dto.area,
      dto.capacity,
      dto.bedCount,
      dto.bedType,
      dto.description,
      dto.amenities,
      dto.images,
      dto.inventory,
      dto.basePrice,
      dto.viewDirection,
    );

    return this.commandBus.execute(command);
  }

  /**
   * Create a new physical hotel room under a room type
   */
  @Post("hotel/room-types/:roomTypeId/rooms")
  @Permissions("hotel:create", "hotel:manage")
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Create a new physical hotel room" })
  @ApiParam({
    name: "roomTypeId",
    description: "Room type unique identifier",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  @ApiResponse({
    status: 201,
    description: "Hotel room created successfully",
    type: HotelRoomResponseDto,
  })
  @ApiResponse({ status: 400, description: "Bad request - validation failed" })
  @ApiResponse({ status: 404, description: "Room type not found" })
  @ApiResponse({
    status: 403,
    description: "Forbidden - insufficient permissions",
  })
  async createHotelRoom(
    @Param("roomTypeId") roomTypeId: string,
    @Body() dto: CreateHotelRoomDto,
  ): Promise<HotelRoomResponseDto> {
    // Ensure roomTypeId from path matches the one in body
    const command = new CreateHotelRoomCommand(
      roomTypeId,
      dto.roomNumber,
      dto.floorId,
      dto.notes,
    );

    return this.commandBus.execute(command);
  }
}
