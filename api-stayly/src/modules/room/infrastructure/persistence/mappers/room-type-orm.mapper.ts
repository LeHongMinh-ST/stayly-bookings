import { RoomType } from "../../../domain/entities/room-type.entity";
import { RoomTypeId } from "../../../domain/value-objects/room-type-id.vo";
import { RoomTypeCategoryVO } from "../../../domain/value-objects/room-type.vo";
import { GuestCapacityVO } from "../../../domain/value-objects/guest-capacity.vo";
import { BedTypeVO } from "../../../domain/value-objects/bed-type.vo";
import { RoomImageVO } from "../../../domain/value-objects/room-image.vo";
import { RoomInventoryVO } from "../../../domain/value-objects/room-inventory.vo";
import { RoomStatusVO } from "../../../domain/value-objects/room-status.vo";
import { MoneyVO } from "../../../domain/value-objects/money.vo";
import { HotelRoom } from "../../../domain/entities/hotel-room.entity";
import { HotelRoomId } from "../../../domain/value-objects/hotel-room-id.vo";
import { RoomNumberVO } from "../../../domain/value-objects/room-number.vo";
import { HotelRoomStatusVO } from "../../../domain/value-objects/hotel-room-status.vo";
import { RoomTypeOrmEntity } from "../entities/room-type.orm-entity";
import { HotelRoomOrmEntity } from "../entities/hotel-room.orm-entity";

export class RoomTypeOrmMapper {
  static toDomain(
    entity: RoomTypeOrmEntity,
    rooms?: HotelRoomOrmEntity[],
  ): RoomType {
    const roomEntities = rooms ?? entity.rooms ?? [];

    return RoomType.rehydrate({
      id: RoomTypeId.create(entity.id),
      hotelId: entity.hotelId,
      name: entity.name,
      category: RoomTypeCategoryVO.create(entity.category as never),
      area: entity.area,
      capacity: GuestCapacityVO.create(entity.capacity),
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
      basePrice: MoneyVO.create({
        amount: Number(entity.basePriceAmount),
        currency: entity.basePriceCurrency,
      }),
      viewDirection: entity.viewDirection ?? undefined,
      rooms: roomEntities.map((room) =>
        HotelRoom.rehydrate({
          id: HotelRoomId.create(room.id),
          roomTypeId: RoomTypeId.create(room.roomTypeId),
          roomNumber: RoomNumberVO.create(room.roomNumber),
          status: HotelRoomStatusVO.create(room.status as never),
          floorId: room.floorId ?? undefined,
          notes: room.notes ?? undefined,
        }),
      ),
    });
  }

  static toOrm(roomType: RoomType): RoomTypeOrmEntity {
    const entity = new RoomTypeOrmEntity();
    entity.id = roomType.getId().getValue();
    entity.hotelId = roomType.getHotelId();
    entity.name = roomType.getName();
    entity.category = roomType.getCategory().value();
    entity.area = roomType.getArea();
    entity.capacity = {
      maxAdults: roomType.getCapacity().getMaxAdults(),
      maxChildren: roomType.getCapacity().getMaxChildren(),
    };
    entity.bedCount = roomType.getBedCount();
    entity.bedType = roomType.getBedType().value();
    entity.description = roomType.getDescription();
    entity.amenities = roomType.getAmenities();
    entity.images = roomType.getImages().map((image) => ({
      url: image.getUrl(),
      type: image.getType(),
      order: image.getOrder(),
    }));
    entity.inventory = roomType.getInventory().value();
    entity.status = roomType.getStatus().value();
    entity.basePriceAmount = roomType.getBasePrice().getAmount();
    entity.basePriceCurrency = roomType.getBasePrice().getCurrency();
    entity.viewDirection = roomType.getViewDirection() ?? null;
    entity.rooms = roomType
      .getRooms()
      .map((room) => RoomTypeOrmMapper.toHotelRoomOrm(room));
    return entity;
  }

  static toHotelRoomOrm(room: HotelRoom): HotelRoomOrmEntity {
    const entity = new HotelRoomOrmEntity();
    entity.id = room.getId().getValue();
    entity.roomTypeId = room.getRoomTypeId().getValue();
    entity.roomNumber = room.getRoomNumber().getValue();
    entity.floorId = room.getFloorId() ?? null;
    entity.status = room.getStatus().value();
    entity.notes = room.getNotes() ?? null;
    return entity;
  }

  static hotelRoomToOrm(room: HotelRoom): HotelRoomOrmEntity {
    return this.toHotelRoomOrm(room);
  }

  static hotelRoomToDomain(entity: HotelRoomOrmEntity): HotelRoom {
    return HotelRoom.rehydrate({
      id: HotelRoomId.create(entity.id),
      roomTypeId: RoomTypeId.create(entity.roomTypeId),
      roomNumber: RoomNumberVO.create(entity.roomNumber),
      status: HotelRoomStatusVO.create(entity.status as never),
      floorId: entity.floorId ?? undefined,
      notes: entity.notes ?? undefined,
    });
  }
}
