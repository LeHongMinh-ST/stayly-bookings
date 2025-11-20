import { Room } from "../../../domain/entities/room.entity";
import { RoomId } from "../../../domain/value-objects/room-id.vo";
import { RoomTypeCategoryVO } from "../../../domain/value-objects/room-type.vo";
import { GuestCapacityVO } from "../../../domain/value-objects/guest-capacity.vo";
import { BedTypeVO } from "../../../domain/value-objects/bed-type.vo";
import { RoomImageVO } from "../../../domain/value-objects/room-image.vo";
import { RoomInventoryVO } from "../../../domain/value-objects/room-inventory.vo";
import { RoomStatusVO } from "../../../domain/value-objects/room-status.vo";
import { MoneyVO } from "../../../domain/value-objects/money.vo";
import { RoomOrmEntity } from "../entities/room.orm-entity";

export class RoomOrmMapper {
  static toDomain(entity: RoomOrmEntity): Room {
    return Room.rehydrate({
      id: RoomId.create(entity.id),
      accommodationId: entity.accommodationId,
      name: entity.name,
      category: RoomTypeCategoryVO.create(entity.category as never),
      area: entity.area,
      guestCapacity: GuestCapacityVO.create(entity.guestCapacity),
      bedCount: entity.bedCount,
      bedType: BedTypeVO.create(entity.bedType as never),
      description: entity.description,
      amenities: entity.amenities,
      images: entity.images.map((image) =>
        RoomImageVO.create({
          url: image.url,
          type: image.type as never,
          order: image.order,
        }),
      ),
      inventory: RoomInventoryVO.create(entity.inventory),
      status: RoomStatusVO.create(entity.status as never),
      basePrice:
        entity.basePriceAmount && entity.basePriceCurrency
          ? MoneyVO.create({
              amount: Number(entity.basePriceAmount),
              currency: entity.basePriceCurrency,
            })
          : undefined,
    });
  }

  static toOrm(room: Room): RoomOrmEntity {
    const entity = new RoomOrmEntity();
    entity.id = room.getId().getValue();
    entity.accommodationId = room.getAccommodationId();
    entity.name = room.getName();
    entity.category = room.getCategory().value();
    entity.area = room.getArea();
    entity.guestCapacity = {
      maxAdults: room.getGuestCapacity().getMaxAdults(),
      maxChildren: room.getGuestCapacity().getMaxChildren(),
    };
    entity.bedCount = room.getBedCount();
    entity.bedType = room.getBedType().value();
    entity.description = room.getDescription();
    entity.amenities = room.getAmenities();
    entity.images = room.getImages().map((image) => ({
      url: image.getUrl(),
      type: image.getType(),
      order: image.getOrder(),
    }));
    entity.inventory = room.getInventory().value();
    entity.status = room.getStatus().value();

    const basePrice = room.getBasePrice();
    entity.basePriceAmount = basePrice ? basePrice.getAmount() : null;
    entity.basePriceCurrency = basePrice ? basePrice.getCurrency() : null;

    return entity;
  }
}
