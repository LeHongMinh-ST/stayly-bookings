/**
 * JwtPayload value object standardizes fields encoded in access tokens
 */
import { InvalidInputError } from "../../../../common/domain/errors";

export interface JwtPayloadProps {
  sub: string;
  email: string;
  roles: string[];
  permissions: string[];
  tokenId?: string;
  userType?: "user" | "customer"; // Distinguish between user and customer
}

export class JwtPayload {
  private constructor(private readonly props: JwtPayloadProps) {}

  static create(props: JwtPayloadProps): JwtPayload {
    if (!props.sub) {
      throw new InvalidInputError(
        "JwtPayload requires subject identifier",
        "sub",
      );
    }
    if (!props.email) {
      throw new InvalidInputError("JwtPayload requires email claim", "email");
    }
    return new JwtPayload({
      ...props,
      roles: props.roles ?? [],
      permissions: props.permissions ?? [],
    });
  }

  getProps(): JwtPayloadProps {
    return {
      ...this.props,
      roles: [...this.props.roles],
      permissions: [...this.props.permissions],
    };
  }
}
