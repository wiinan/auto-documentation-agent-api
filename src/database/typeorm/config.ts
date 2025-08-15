import { DataSource, DataSourceOptions } from 'typeorm';
import { Global, Module } from '@nestjs/common';

const databaseConfig = (): DataSourceOptions => ({
  type: 'postgres',
  port: process.env.DATABASE_PORT ? +process.env.DATABASE_PORT : 5432,
  host: process.env.DATABASE_HOST,
  username: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_DATABASE,
  entities: [__dirname + '/entities/*.entity{.ts,.js}'],
  migrations: [__dirname + '/migration/*.{js,ts}'],
  synchronize: false,
  logging: true,
});

@Global() // makes the module available globally for other modules once imported in the app modules
@Module({
  imports: [],
  providers: [
    {
      provide: DataSource, // add the datasource as a provider
      inject: [],
      useFactory: async () => {
        // using the factory function to create the datasource instance
        try {
          const dataSource = new DataSource(databaseConfig());
          await dataSource.initialize(); // initialize the data source
          const migrations = await dataSource.runMigrations();
          console.log('Database connected successfully', migrations);
          return dataSource;
        } catch (error) {
          console.log('Error connecting to database');
          throw error;
        }
      },
    },
  ],
  exports: [DataSource],
})
export class TypeOrmModule {}
