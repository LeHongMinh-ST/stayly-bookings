/**
 * AccommodationsController
 * REST API endpoints for accommodation management
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
import { CreateAccommodationCommand } from "../../application/commands/create-accommodation.command";
import { GetAccommodationQuery } from "../../application/queries/get-accommodation.query";
import { ListAccommodationsQuery } from "../../application/queries/list-accommodations.query";
import { CreateAccommodationDto } from "../../application/dto/request/create-accommodation.dto";
import { AccommodationResponseDto } from "../../application/dto/response/accommodation-response.dto";
import { AccommodationCollectionDto } from "../../application/dto/response/accommodation-collection.dto";
import { AccommodationType } from "../../domain/entities/accommodation.entity";
import { AccommodationDtoMapper } from "../../infrastructure/persistence/mappers/accommodation-dto.mapper";
import { ParseIntPipe } from "@nestjs/common";
import {
  DEFAULT_PAGE_SIZE,
  DEFAULT_PAGE_NUMBER,
} from "../../../../common/constants";

@Controller("v1/accommodations")
@ApiTags("accommodations")
@UseGuards(JwtUserGuard)
@ApiBearerAuth("JWT-auth")
export class AccommodationsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly dtoMapper: AccommodationDtoMapper,
  ) {}

  /**
   * Create a new accommodation (homestay or hotel)
   */
  @Post()
  @Permissions("homestay:create", "homestay:manage")
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Create a new accommodation" })
  @ApiResponse({
    status: 201,
    description: "Accommodation created successfully",
    type: AccommodationResponseDto,
  })
  @ApiResponse({ status: 400, description: "Bad request - validation failed" })
  @ApiResponse({
    status: 403,
    description: "Forbidden - insufficient permissions",
  })
  async create(
    @Body() dto: CreateAccommodationDto,
  ): Promise<AccommodationResponseDto> {
    const command = new CreateAccommodationCommand(
      dto.type,
      dto.name,
      "", // ownerId will be extracted from JWT token in handler
      dto.address,
      dto.location,
      dto.description,
      dto.images,
      dto.amenities,
      dto.policies,
      dto.cancellationPolicy,
    );

    return this.commandBus.execute(command);
  }

  /**
   * Get accommodation by ID
   */
  @Get(":id")
  @Permissions("homestay:read", "homestay:manage")
  @ApiOperation({ summary: "Get accommodation by ID" })
  @ApiParam({
    name: "id",
    description: "Accommodation unique identifier",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  @ApiResponse({
    status: 200,
    description: "Accommodation found",
    type: AccommodationResponseDto,
  })
  @ApiResponse({ status: 404, description: "Accommodation not found" })
  async getById(
    @Param("id") id: string,
  ): Promise<AccommodationResponseDto | null> {
    const query = new GetAccommodationQuery(id);
    return this.queryBus.execute(query);
  }

  /**
   * List accommodations with filters and pagination
   */
  @Get()
  @Permissions("homestay:read", "homestay:manage")
  @ApiOperation({ summary: "List accommodations with pagination" })
  @ApiQuery({
    name: "ownerId",
    required: false,
    description: "Filter by owner ID",
  })
  @ApiQuery({
    name: "type",
    required: false,
    description: "Filter by type (homestay/hotel)",
    enum: AccommodationType,
  })
  @ApiQuery({
    name: "status",
    required: false,
    description: "Filter by status",
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
    description: "Paginated list of accommodations",
    type: AccommodationCollectionDto,
  })
  async list(
    @Query("ownerId") ownerId?: string,
    @Query("type") type?: string,
    @Query("status") status?: string,
    @Query("page", new ParseIntPipe({ optional: true }))
    page: number = DEFAULT_PAGE_NUMBER,
    @Query("limit", new ParseIntPipe({ optional: true }))
    limit: number = DEFAULT_PAGE_SIZE,
  ): Promise<AccommodationCollectionDto> {
    const accommodationType: AccommodationType | undefined =
      type &&
      Object.values(AccommodationType).includes(type as AccommodationType)
        ? (type as AccommodationType)
        : undefined;
    const query = new ListAccommodationsQuery(
      ownerId,
      accommodationType,
      status,
      page,
      limit,
    );
    return this.queryBus.execute(query);
  }
}
