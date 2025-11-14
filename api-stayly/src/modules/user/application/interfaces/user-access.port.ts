/**
 * IUserAccessPort exposes user lookup capabilities for external modules.
 * Following the Port/Adapter pattern, this contract resides in the application layer.
 */
import type { UserResponseDto } from "../dto/response/user-response.dto";

export interface IUserAccessPort {
  /**
   * Ensures the given user exists.
   * @throws Error when the user cannot be found.
   */
  ensureUserExists(userId: string): Promise<void>;

  /**
   * Retrieves user information formatted for presentation.
   */
  getUserResponse(userId: string): Promise<UserResponseDto>;
}

export const USER_ACCESS_PORT = "USER_ACCESS_PORT";
