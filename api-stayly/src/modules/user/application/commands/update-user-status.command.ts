/**
 * UpdateUserStatusCommand carries intent to change user lifecycle status
 */
import { UserStatus } from "../../domain/value-objects/user-status.vo";

export class UpdateUserStatusCommand {
  constructor(
    public readonly userId: string,
    public readonly status: UserStatus,
  ) {}
}
