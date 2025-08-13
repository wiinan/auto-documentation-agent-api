import { Module } from '@nestjs/common';
import { WebScrapingModule } from './modules/web-scraping/web-scraping.module';
import { ConfigModule } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { TypeOrmModule } from './database/config';
import { OpenAiModule } from './modules/openai/openai.module';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    MongooseModule.forRoot(process.env.MONGODB_URI || '', {
      dbName: 'dev_documentation',
    }),
    TypeOrmModule,
    WebScrapingModule,
    OpenAiModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {
  constructor(private dataSouce: DataSource) {}
}
