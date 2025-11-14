import {
  MigrationInterface,
  QueryRunner,
  TableColumn,
  TableIndex,
} from 'typeorm';

export class RemoveCodeFromRoles1700000000004
  implements MigrationInterface
{
  name = 'RemoveCodeFromRoles1700000000004';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Drop unique index on code if exists
    const rolesTable = await queryRunner.getTable('roles');
    if (rolesTable) {
      const codeIndex = rolesTable.indices.find(
        (idx) => idx.columnNames.includes('code'),
      );
      if (codeIndex) {
        await queryRunner.dropIndex('roles', codeIndex);
      }
    }

    // Drop code column from roles table
    await queryRunner.dropColumn('roles', 'code');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Add code column back
    await queryRunner.addColumn(
      'roles',
      new TableColumn({
        name: 'code',
        type: 'varchar',
        isUnique: true,
        isNullable: false,
      }),
    );

    // Create unique index on code
    await queryRunner.createIndex(
      'roles',
      new TableIndex({
        name: 'UQ_roles_code',
        columnNames: ['code'],
        isUnique: true,
      }),
    );
  }
}

