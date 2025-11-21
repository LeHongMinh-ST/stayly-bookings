import { MigrationInterface, QueryRunner, Table, TableIndex } from "typeorm";

/**
 * Creates notification_logs table for auditing outbound notifications
 */
export class CreateNotificationLogsTable1700000000007
  implements MigrationInterface
{
  name = "CreateNotificationLogsTable1700000000007";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "notification_logs",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
            generationStrategy: "uuid",
            default: "uuid_generate_v4()",
          },
          { name: "channel", type: "varchar", length: "32" },
          { name: "template_key", type: "varchar", length: "120" },
          { name: "recipient", type: "jsonb" },
          { name: "payload", type: "jsonb" },
          { name: "metadata", type: "jsonb", isNullable: true },
          { name: "status", type: "varchar", length: "20" },
          { name: "attempts", type: "int", default: 0 },
          { name: "scheduled_at", type: "timestamptz", isNullable: true },
          { name: "last_attempt_at", type: "timestamptz", isNullable: true },
          { name: "sent_at", type: "timestamptz", isNullable: true },
          { name: "error_message", type: "text", isNullable: true },
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
      "notification_logs",
      new TableIndex({
        name: "idx_notification_logs_status",
        columnNames: ["status"],
      }),
    );
    await queryRunner.createIndex(
      "notification_logs",
      new TableIndex({
        name: "idx_notification_logs_template",
        columnNames: ["template_key"],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex(
      "notification_logs",
      "idx_notification_logs_template",
    );
    await queryRunner.dropIndex(
      "notification_logs",
      "idx_notification_logs_status",
    );
    await queryRunner.dropTable("notification_logs");
  }
}
