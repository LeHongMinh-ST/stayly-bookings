/**
 * IPasswordResetRequestRepository persists password reset aggregates
 */
import type { PasswordResetRequest } from "../entities/password-reset-request.entity";
import type { PasswordResetRequestId } from "../value-objects/password-reset-request-id.vo";
import type {
  PasswordResetStatus,
  PasswordResetSubjectType,
} from "../types/password-reset.types";

export interface IPasswordResetRequestRepository {
  save(this: void, request: PasswordResetRequest): Promise<void>;
  findById(
    this: void,
    id: PasswordResetRequestId,
  ): Promise<PasswordResetRequest | null>;
  findByTokenHash(
    this: void,
    tokenHash: string,
  ): Promise<PasswordResetRequest | null>;
  findLatestBySubject(
    this: void,
    subjectId: string,
    subjectType: PasswordResetSubjectType,
    statuses?: PasswordResetStatus[],
  ): Promise<PasswordResetRequest | null>;
}

export const PASSWORD_RESET_REQUEST_REPOSITORY =
  "PASSWORD_RESET_REQUEST_REPOSITORY";
