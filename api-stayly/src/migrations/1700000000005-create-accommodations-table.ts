import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
  TableIndex,
} from "typeorm";

export class CreateAccommodationsTable1700000000005
  implements MigrationInterface
{
  name = "CreateAccommodationsTable1700000000005";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "accommodations",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
            generationStrategy: "uuid",
            default: "uuid_generate_v4()",
          },
          {
            name: "type",
            type: "varchar",
            length: "20",
            isNullable: false,
          },
          {
            name: "name",
            type: "varchar",
            length: "255",
            isNullable: false,
          },
          {
            name: "status",
            type: "varchar",
            length: "50",
            isNullable: false,
            default: "'active'",
          },
          {
            name: "owner_id",
            type: "uuid",
            isNullable: false,
          },
          {
            name: "street",
            type: "varchar",
            length: "255",
            isNullable: false,
          },
          {
            name: "ward",
            type: "varchar",
            length: "100",
            isNullable: false,
          },
          {
            name: "district",
            type: "varchar",
            length: "100",
            isNullable: false,
          },
          {
            name: "province",
            type: "varchar",
            length: "100",
            isNullable: false,
          },
          {
            name: "country",
            type: "varchar",
            length: "100",
            isNullable: false,
          },
          {
            name: "latitude",
            type: "decimal",
            precision: 10,
            scale: 8,
            isNullable: false,
          },
          {
            name: "longitude",
            type: "decimal",
            precision: 11,
            scale: 8,
            isNullable: false,
          },
          {
            name: "description",
            type: "text",
            isNullable: false,
          },
          {
            name: "images",
            type: "jsonb",
            isNullable: false,
          },
          {
            name: "amenities",
            type: "jsonb",
            isNullable: false,
          },
          {
            name: "check_in_time",
            type: "varchar",
            length: "10",
            isNullable: false,
          },
          {
            name: "check_out_time",
            type: "varchar",
            length: "10",
            isNullable: false,
          },
          {
            name: "children_allowed",
            type: "boolean",
            isNullable: false,
            default: false,
          },
          {
            name: "pets_allowed",
            type: "boolean",
            isNullable: false,
            default: false,
          },
          {
            name: "smoking_allowed",
            type: "boolean",
            isNullable: false,
            default: false,
          },
          {
            name: "cancellation_policy_type",
            type: "varchar",
            length: "50",
            isNullable: false,
          },
          {
            name: "free_cancellation_days",
            type: "integer",
            isNullable: false,
            default: 0,
          },
          {
            name: "refund_percentage",
            type: "integer",
            isNullable: false,
            default: 100,
          },
          {
            name: "star_rating",
            type: "integer",
            isNullable: true,
          },
          {
            name: "total_floors",
            type: "integer",
            isNullable: true,
          },
          {
            name: "total_rooms",
            type: "integer",
            isNullable: true,
          },
          {
            name: "year_built",
            type: "integer",
            isNullable: true,
          },
          {
            name: "year_renovated",
            type: "integer",
            isNullable: true,
          },
          {
            name: "contact_phone",
            type: "varchar",
            length: "20",
            isNullable: true,
          },
          {
            name: "contact_email",
            type: "varchar",
            length: "255",
            isNullable: true,
          },
          {
            name: "website",
            type: "varchar",
            length: "255",
            isNullable: true,
          },
          {
            name: "created_at",
            type: "timestamp with time zone",
            default: "now()",
          },
          {
            name: "updated_at",
            type: "timestamp with time zone",
            default: "now()",
          },
        ],
      }),
      true,
    );

    await queryRunner.createIndex(
      "accommodations",
      new TableIndex({
        name: "idx_accommodations_owner_id",
        columnNames: ["owner_id"],
      }),
    );

    await queryRunner.createIndex(
      "accommodations",
      new TableIndex({
        name: "idx_accommodations_status",
        columnNames: ["status"],
      }),
    );

    await queryRunner.createIndex(
      "accommodations",
      new TableIndex({
        name: "idx_accommodations_type",
        columnNames: ["type"],
      }),
    );

    await queryRunner.createForeignKey(
      "accommodations",
      new TableForeignKey({
        columnNames: ["owner_id"],
        referencedTableName: "users",
        referencedColumnNames: ["id"],
        onDelete: "CASCADE",
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const accommodationsTable = await queryRunner.getTable("accommodations");
    if (accommodationsTable) {
      for (const foreignKey of accommodationsTable.foreignKeys) {
        await queryRunner.dropForeignKey("accommodations", foreignKey);
      }
    }

    await queryRunner.dropIndex("accommodations", "idx_accommodations_type");
    await queryRunner.dropIndex("accommodations", "idx_accommodations_status");
    await queryRunner.dropIndex(
      "accommodations",
      "idx_accommodations_owner_id",
    );
    await queryRunner.dropTable("accommodations");
  }
}
