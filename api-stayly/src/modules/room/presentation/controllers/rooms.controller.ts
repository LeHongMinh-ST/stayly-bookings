/**
 * RoomsController
 * REST API endpoints for room management (homestay and hotel)
 */

import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from "@nestjs/swagger";
import { CommandBus, QueryBus } from "@nestjs/cqrs";
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
import { RoomCollectionDto } from "../../application/dto/response/room-collection.dto";
import { RoomTypeCollectionDto } from "../../application/dto/response/room-type-collection.dto";
import { HotelRoomCollectionDto } from "../../application/dto/response/hotel-room-collection.dto";
import { ListHomestayRoomsQuery } from "../../application/queries/list-homestay-rooms.query";
import { ListRoomTypesQuery } from "../../application/queries/list-room-types.query";
import { ListHotelRoomsQuery } from "../../application/queries/list-hotel-rooms.query";
import { RoomStatus } from "../../domain/value-objects/room-status.vo";
import { HotelRoomStatus } from "../../domain/value-objects/hotel-room-status.vo";
import {
  DEFAULT_PAGE_SIZE,
  DEFAULT_PAGE_NUMBER,
} from "../../../../common/constants/commons";

@Controller("v1/rooms")
@ApiTags("rooms")
@UseGuards(JwtUserGuard)
@ApiBearerAuth("JWT-auth")
export class RoomsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

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

  /**
   * List homestay rooms with filters and pagination
   */
  @Get("homestay")
  @Permissions("homestay:read", "homestay:manage")
  @ApiOperation({ summary: "List homestay rooms with pagination" })
  @ApiQuery({
    name: "accommodationId",
    required: false,
    description: "Filter by accommodation ID",
  })
  @ApiQuery({
    name: "status",
    required: false,
    description: "Filter by status",
    enum: RoomStatus,
  })
  @ApiQuery({
    name: "page",
    required: false,
    type: Number,
    description: "Page number (starts from 1)",
    example: 1,
  })
  @ApiQuery({
    name: "limit",
    required: false,
    type: Number,
    description: "Number of items per page",
    example: 20,
  })
  @ApiResponse({
    status: 200,
    description: "Paginated list of homestay rooms",
    type: RoomCollectionDto,
  })
  async listHomestayRooms(
    @Query("accommodationId") accommodationId?: string,
    @Query("status") status?: string,
    @Query("page", new ParseIntPipe({ optional: true }))
    page: number = DEFAULT_PAGE_NUMBER,
    @Query("limit", new ParseIntPipe({ optional: true }))
    limit: number = DEFAULT_PAGE_SIZE,
  ): Promise<RoomCollectionDto> {
    const roomStatus: RoomStatus | undefined =
      status && Object.values(RoomStatus).includes(status as RoomStatus)
        ? (status as RoomStatus)
        : undefined;

    const query = new ListHomestayRoomsQuery(
      accommodationId,
      roomStatus,
      page,
      limit,
    );
    return this.queryBus.execute(query);
  }

  /**
   * List hotel room types with filters and pagination
   */
  @Get("hotel/room-types")
  @Permissions("hotel:read", "hotel:manage")
  @ApiOperation({ summary: "List hotel room types with pagination" })
  @ApiQuery({
    name: "hotelId",
    required: false,
    description: "Filter by hotel ID",
  })
  @ApiQuery({
    name: "status",
    required: false,
    description: "Filter by status",
    enum: RoomStatus,
  })
  @ApiQuery({
    name: "page",
    required: false,
    type: Number,
    description: "Page number (starts from 1)",
    example: 1,
  })
  @ApiQuery({
    name: "limit",
    required: false,
    type: Number,
    description: "Number of items per page",
    example: 20,
  })
  @ApiResponse({
    status: 200,
    description: "Paginated list of hotel room types",
    type: RoomTypeCollectionDto,
  })
  async listRoomTypes(
    @Query("hotelId") hotelId?: string,
    @Query("status") status?: string,
    @Query("page", new ParseIntPipe({ optional: true }))
    page: number = DEFAULT_PAGE_NUMBER,
    @Query("limit", new ParseIntPipe({ optional: true }))
    limit: number = DEFAULT_PAGE_SIZE,
  ): Promise<RoomTypeCollectionDto> {
    const roomStatus: RoomStatus | undefined =
      status && Object.values(RoomStatus).includes(status as RoomStatus)
        ? (status as RoomStatus)
        : undefined;

    const query = new ListRoomTypesQuery(hotelId, roomStatus, page, limit);
    return this.queryBus.execute(query);
  }

  /**
   * List physical hotel rooms with filters and pagination
   */
  @Get("hotel/rooms")
  @Permissions("hotel:read", "hotel:manage")
  @ApiOperation({ summary: "List physical hotel rooms with pagination" })
  @ApiQuery({
    name: "roomTypeId",
    required: false,
    description: "Filter by room type ID",
  })
  @ApiQuery({
    name: "floorId",
    required: false,
    description: "Filter by floor ID",
  })
  @ApiQuery({
    name: "status",
    required: false,
    description: "Filter by status",
    enum: HotelRoomStatus,
  })
  @ApiQuery({
    name: "page",
    required: false,
    type: Number,
    description: "Page number (starts from 1)",
    example: 1,
  })
  @ApiQuery({
    name: "limit",
    required: false,
    type: Number,
    description: "Number of items per page",
    example: 20,
  })
  @ApiResponse({
    status: 200,
    description: "Paginated list of physical hotel rooms",
    type: HotelRoomCollectionDto,
  })
  async listHotelRooms(
    @Query("roomTypeId") roomTypeId?: string,
    @Query("floorId") floorId?: string,
    @Query("status") status?: string,
    @Query("page", new ParseIntPipe({ optional: true }))
    page: number = DEFAULT_PAGE_NUMBER,
    @Query("limit", new ParseIntPipe({ optional: true }))
    limit: number = DEFAULT_PAGE_SIZE,
  ): Promise<HotelRoomCollectionDto> {
    const hotelRoomStatus: HotelRoomStatus | undefined =
      status &&
      Object.values(HotelRoomStatus).includes(status as HotelRoomStatus)
        ? (status as HotelRoomStatus)
        : undefined;

    const query = new ListHotelRoomsQuery(
      roomTypeId,
      floorId,
      hotelRoomStatus,
      page,
      limit,
    );
    return this.queryBus.execute(query);
  }
}
