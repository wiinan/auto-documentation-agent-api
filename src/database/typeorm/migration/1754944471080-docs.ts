import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export class Docs1754944471080 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await Promise.all([
      queryRunner.createTable(
        new Table({
          name: 'docs',
          columns: [
            {
              name: 'id',
              type: 'int',
              isPrimary: true,
              isGenerated: true,
              generationStrategy: 'increment',
            },
            {
              name: 'name',
              type: 'varchar',
              isNullable: false,
            },
            {
              name: 'link',
              type: 'text',
              isNullable: false,
            },
            {
              name: 'status',
              type: 'varchar',
              isNullable: false,
            },
            {
              name: 'modelName',
              type: 'varchar',
              isNullable: true,
            },
            {
              name: 'fineTuneJobId',
              type: 'varchar',
              isNullable: true,
            },
            {
              name: 'createdAt',
              type: 'timestamp',
              default: 'now()',
            },
            {
              name: 'updatedAt',
              type: 'timestamp',
              default: 'now()',
            },
            {
              name: 'isDeleted',
              type: 'boolean',
              default: false,
              isNullable: false,
            },
          ],
        }),
        true,
      ),
      queryRunner.createTable(
        new Table({
          name: 'doc_contents',
          columns: [
            {
              name: 'id',
              type: 'int',
              isPrimary: true,
              isGenerated: true,
              generationStrategy: 'increment',
            },
            {
              name: 'docId',
              type: 'int',
              isNullable: false,
            },
            {
              name: 'content',
              type: 'text',
            },
            {
              name: 'link',
              type: 'text',
              isNullable: false,
            },
            {
              name: 'createdAt',
              type: 'timestamp',
              default: 'now()',
            },
            {
              name: 'updatedAt',
              type: 'timestamp',
              default: 'now()',
            },
            {
              name: 'isDeleted',
              type: 'boolean',
              default: false,
              isNullable: false,
            },
          ],
        }),
      ),
    ]);

    await queryRunner.query(
      `ALTER TABLE "doc_contents" ADD COLUMN "embedding" vector(768)`,
    );

    await queryRunner.createForeignKey(
      'doc_contents',
      new TableForeignKey({
        columnNames: ['docId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'docs',
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await Promise.all([
      queryRunner.dropTable('docs'),
      queryRunner.dropTable('doc_contents'),
    ]);
  }
}
