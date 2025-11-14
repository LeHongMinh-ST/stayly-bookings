import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableColumn,
  TableForeignKey,
  TableIndex,
} from "typeorm";

export class AddRolePermissionsRelationship1700000000003
  implements MigrationInterface
{
  name = "AddRolePermissionsRelationship1700000000003";

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add is_super_admin column to roles table
    await queryRunner.addColumn(
      "roles",
      new TableColumn({
        name: "is_super_admin",
        type: "boolean",
        default: false,
        isNullable: false,
      }),
    );

    // Create index on is_super_admin for better query performance
    await queryRunner.createIndex(
      "roles",
      new TableIndex({
        name: "idx_roles_is_super_admin",
        columnNames: ["is_super_admin"],
      }),
    );

    // Create role_permissions junction table (many-to-many)
    await queryRunner.createTable(
      new Table({
        name: "role_permissions",
        columns: [
          {
            name: "role_id",
            type: "uuid",
            isPrimary: true,
          },
          {
            name: "permission_id",
            type: "uuid",
            isPrimary: true,
          },
        ],
      }),
      true,
    );

    // Add foreign keys for role_permissions table
    await queryRunner.createForeignKey(
      "role_permissions",
      new TableForeignKey({
        columnNames: ["role_id"],
        referencedTableName: "roles",
        referencedColumnNames: ["id"],
        onDelete: "CASCADE",
      }),
    );

    await queryRunner.createForeignKey(
      "role_permissions",
      new TableForeignKey({
        columnNames: ["permission_id"],
        referencedTableName: "permissions",
        referencedColumnNames: ["id"],
        onDelete: "CASCADE",
      }),
    );

    // Create indexes for role_permissions table
    await queryRunner.createIndex(
      "role_permissions",
      new TableIndex({
        name: "idx_role_permissions_role_id",
        columnNames: ["role_id"],
      }),
    );

    await queryRunner.createIndex(
      "role_permissions",
      new TableIndex({
        name: "idx_role_permissions_permission_id",
        columnNames: ["permission_id"],
      }),
    );

    // Update seed data: set is_super_admin = true for super_admin role
    await queryRunner.query(
      "UPDATE roles SET is_super_admin = true WHERE code = 'super_admin'",
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.dropIndex(
      "role_permissions",
      "idx_role_permissions_permission_id",
    );
    await queryRunner.dropIndex(
      "role_permissions",
      "idx_role_permissions_role_id",
    );
    await queryRunner.dropIndex("roles", "idx_roles_is_super_admin");

    // Drop foreign keys
    const rolePermissionsTable = await queryRunner.getTable("role_permissions");
    if (rolePermissionsTable) {
      const foreignKeys = rolePermissionsTable.foreignKeys;
      for (const foreignKey of foreignKeys) {
        await queryRunner.dropForeignKey("role_permissions", foreignKey);
      }
    }

    // Drop role_permissions table
    await queryRunner.dropTable("role_permissions");

    // Remove is_super_admin column
    await queryRunner.dropColumn("roles", "is_super_admin");
  }
}
