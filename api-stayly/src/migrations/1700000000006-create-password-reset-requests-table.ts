import { MigrationInterface, QueryRunner, Table, TableIndex } from "typeorm";

/**
 * Creates auth_password_reset_requests table to store OTP + link reset flow
 */
export class CreatePasswordResetRequestsTable1700000000006
  implements MigrationInterface
{
  name = "CreatePasswordResetRequestsTable1700000000006";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "auth_password_reset_requests",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
            generationStrategy: "uuid",
            default: "uuid_generate_v4()",
          },
          {
            name: "subject_id",
            type: "uuid",
            isNullable: false,
          },
          {
            name: "subject_type",
            type: "varchar",
            length: "20",
            isNullable: false,
          },
          {
            name: "token_hash",
            type: "varchar",
            length: "191",
            isNullable: false,
            isUnique: true,
          },
          {
            name: "otp_hash",
            type: "varchar",
            length: "191",
            isNullable: false,
          },
          {
            name: "status",
            type: "varchar",
            length: "20",
            isNullable: false,
          },
          {
            name: "attempt_count",
            type: "int",
            isNullable: false,
            default: 0,
          },
          {
            name: "max_attempts",
            type: "int",
            isNullable: false,
          },
          {
            name: "expires_at",
            type: "timestamptz",
            isNullable: false,
          },
          {
            name: "otp_expires_at",
            type: "timestamptz",
            isNullable: false,
          },
          {
            name: "verified_at",
            type: "timestamptz",
            isNullable: true,
          },
          {
            name: "completed_at",
            type: "timestamptz",
            isNullable: true,
          },
          {
            name: "revoked_at",
            type: "timestamptz",
            isNullable: true,
          },
          {
            name: "last_attempt_at",
            type: "timestamptz",
            isNullable: true,
          },
          {
            name: "requested_ip",
            type: "varchar",
            length: "64",
            isNullable: true,
          },
          {
            name: "requested_user_agent",
            type: "varchar",
            length: "512",
            isNullable: true,
          },
          {
            name: "created_at",
            type: "timestamptz",
            default: "CURRENT_TIMESTAMP",
          },
          {
            name: "updated_at",
            type: "timestamptz",
            default: "CURRENT_TIMESTAMP",
          },
        ],
      }),
    );

    await queryRunner.createIndex(
      "auth_password_reset_requests",
      new TableIndex({
        name: "idx_auth_password_reset_subject_status",
        columnNames: ["subject_id", "subject_type", "status"],
      }),
    );

    await queryRunner.createIndex(
      "auth_password_reset_requests",
      new TableIndex({
        name: "idx_auth_password_reset_expiry",
        columnNames: ["expires_at"],
      }),
    );

    await queryRunner.query(
      "ALTER TABLE auth_password_reset_requests ADD CONSTRAINT chk_auth_password_reset_subject_type CHECK (subject_type IN ('user', 'customer'))",
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      "ALTER TABLE auth_password_reset_requests DROP CONSTRAINT IF EXISTS chk_auth_password_reset_subject_type",
    );
    await queryRunner.dropIndex(
      "auth_password_reset_requests",
      "idx_auth_password_reset_expiry",
    );
    await queryRunner.dropIndex(
      "auth_password_reset_requests",
      "idx_auth_password_reset_subject_status",
    );
    await queryRunner.dropTable("auth_password_reset_requests");
  }
}
