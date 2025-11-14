/**
 * FloorType Value Object
 * Represents type of floor in hotel
 */

export enum FloorType {
  ROOM_FLOOR = "room_floor",
  RESTAURANT_FLOOR = "restaurant_floor",
  SPA_FLOOR = "spa_floor",
  GYM_FLOOR = "gym_floor",
  POOL_FLOOR = "pool_floor",
  MEETING_FLOOR = "meeting_floor",
  BUSINESS_FLOOR = "business_floor",
  MIXED_FLOOR = "mixed_floor",
  LOBBY_FLOOR = "lobby_floor",
}

export class FloorTypeVO {
  private constructor(private readonly value: FloorType) {}

  static create(type: FloorType): FloorTypeVO {
    return new FloorTypeVO(type);
  }

  getValue(): FloorType {
    return this.value;
  }

  isRoomFloor(): boolean {
    return (
      this.value === FloorType.ROOM_FLOOR ||
      this.value === FloorType.MIXED_FLOOR
    );
  }

  isServiceFloor(): boolean {
    return [
      FloorType.RESTAURANT_FLOOR,
      FloorType.SPA_FLOOR,
      FloorType.GYM_FLOOR,
      FloorType.POOL_FLOOR,
      FloorType.MEETING_FLOOR,
      FloorType.BUSINESS_FLOOR,
    ].includes(this.value);
  }
}
