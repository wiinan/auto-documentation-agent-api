import { Module } from '@nestjs/common';
import { WebScrapingModule } from './modules/web-scraping/web-scraping.module';
import { ConfigModule } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { OpenAiModule } from './modules/openai/openai.module';
import { MongooseModule } from '@nestjs/mongoose';
import { TypeOrmModule } from './database/typeorm/config';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    MongooseModule.forRoot(process.env.MONGODB_URI || '', {
      dbName: process.env.MONGODB_DATABASE,
    }),
    ScheduleModule.forRoot(),
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
