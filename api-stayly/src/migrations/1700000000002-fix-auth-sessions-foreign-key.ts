import {
  MigrationInterface,
  QueryRunner,
  TableColumn,
  TableForeignKey,
} from "typeorm";

/**
 * Fix auth_sessions foreign key constraint to support both users and customers
 * Adds user_type column and removes the restrictive foreign key
 */
export class FixAuthSessionsForeignKey1700000000002
  implements MigrationInterface
{
  name = "FixAuthSessionsForeignKey1700000000002";

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Drop the existing foreign key constraint that only references users table
    const authSessionsTable = await queryRunner.getTable("auth_sessions");
    if (authSessionsTable) {
      const foreignKey = authSessionsTable.foreignKeys.find(
        (fk) =>
          fk.columnNames.includes("user_id") &&
          fk.referencedTableName === "users",
      );
      if (foreignKey) {
        await queryRunner.dropForeignKey("auth_sessions", foreignKey);
      }
    }

    // Add user_type column to distinguish between 'user' and 'customer'
    await queryRunner.addColumn(
      "auth_sessions",
      new TableColumn({
        name: "user_type",
        type: "varchar",
        length: "20",
        isNullable: false,
        default: "'user'", // Default to 'user' for existing records
      }),
    );

    // Update existing records to have user_type = 'user'
    await queryRunner.query(
      "UPDATE auth_sessions SET user_type = 'user' WHERE user_type IS NULL",
    );

    // Create check constraint to ensure user_type is either 'user' or 'customer'
    await queryRunner.query(
      "ALTER TABLE auth_sessions ADD CONSTRAINT chk_auth_sessions_user_type CHECK (user_type IN ('user', 'customer'))",
    );

    // Create index on user_type for better query performance
    await queryRunner.query(
      "CREATE INDEX idx_auth_sessions_user_type ON auth_sessions(user_type)",
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop index
    await queryRunner.query("DROP INDEX IF EXISTS idx_auth_sessions_user_type");

    // Drop check constraint
    await queryRunner.query(
      "ALTER TABLE auth_sessions DROP CONSTRAINT IF EXISTS chk_auth_sessions_user_type",
    );

    // Remove user_type column
    await queryRunner.dropColumn("auth_sessions", "user_type");

    // Recreate the original foreign key constraint to users table
    await queryRunner.createForeignKey(
      "auth_sessions",
      new TableForeignKey({
        columnNames: ["user_id"],
        referencedTableName: "users",
        referencedColumnNames: ["id"],
        onDelete: "CASCADE",
      }),
    );
  }
}
