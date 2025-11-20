/**
 * RoomImageVO normalizes metadata for room galleries
 */
import { InvalidInputError } from "../../../../common/domain/errors";

export enum RoomImageType {
  INTERIOR = "interior",
  BATHROOM = "bathroom",
  VIEW = "view",
  AMENITY = "amenity",
}

export interface RoomImageProps {
  url: string;
  type?: RoomImageType;
  order?: number;
}

export class RoomImageVO {
  private constructor(
    private readonly url: string,
    private readonly type: RoomImageType,
    private readonly order: number,
  ) {}

  static create(props: RoomImageProps): RoomImageVO {
    if (!props.url?.trim()) {
      throw new InvalidInputError("Room images require a valid URL");
    }

    const order = props.order ?? 0;
    if (!Number.isInteger(order) || order < 0) {
      throw new InvalidInputError("Image order must be a non-negative integer");
    }

    const type = props.type ?? RoomImageType.INTERIOR;

    return new RoomImageVO(props.url.trim(), type, order);
  }

  getUrl(): string {
    return this.url;
  }

  getType(): RoomImageType {
    return this.type;
  }

  getOrder(): number {
    return this.order;
  }
}
