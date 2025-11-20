import { Room } from "../../../domain/entities/room.entity";
import { RoomType } from "../../../domain/entities/room-type.entity";
import { RoomResponseDto } from "../../../application/dto/response/room-response.dto";
import { RoomTypeResponseDto } from "../../../application/dto/response/room-type-response.dto";

export class RoomDtoMapper {
  toRoomDto(room: Room): RoomResponseDto {
    const basePrice = room.getBasePrice();
    return {
      id: room.getId().getValue(),
      accommodationId: room.getAccommodationId(),
      name: room.getName(),
      category: room.getCategory().value(),
      area: room.getArea(),
      bedCount: room.getBedCount(),
      bedType: room.getBedType().value(),
      guestCapacity: {
        maxAdults: room.getGuestCapacity().getMaxAdults(),
        maxChildren: room.getGuestCapacity().getMaxChildren(),
        total: room.getGuestCapacity().getTotalCapacity(),
      },
      status: room.getStatus().value(),
      amenities: room.getAmenities(),
      images: room.getImages().map((image) => ({
        url: image.getUrl(),
        type: image.getType(),
        order: image.getOrder(),
      })),
      inventory: room.getInventory().value(),
      basePrice: basePrice
        ? {
            amount: basePrice.getAmount(),
            currency: basePrice.getCurrency(),
          }
        : undefined,
    };
  }

  toRoomTypeDto(roomType: RoomType): RoomTypeResponseDto {
    return {
      id: roomType.getId().getValue(),
      hotelId: roomType.getHotelId(),
      name: roomType.getName(),
      category: roomType.getCategory().value(),
      area: roomType.getArea(),
      bedCount: roomType.getBedCount(),
      bedType: roomType.getBedType().value(),
      capacity: {
        maxAdults: roomType.getCapacity().getMaxAdults(),
        maxChildren: roomType.getCapacity().getMaxChildren(),
        total: roomType.getCapacity().getTotalCapacity(),
      },
      status: roomType.getStatus().value(),
      amenities: roomType.getAmenities(),
      images: roomType.getImages().map((image) => ({
        url: image.getUrl(),
        type: image.getType(),
        order: image.getOrder(),
      })),
      inventory: roomType.getInventory().value(),
      basePrice: {
        amount: roomType.getBasePrice().getAmount(),
        currency: roomType.getBasePrice().getCurrency(),
      },
      viewDirection: roomType.getViewDirection(),
    };
  }
}
