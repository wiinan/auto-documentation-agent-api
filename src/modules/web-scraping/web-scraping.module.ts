import { Module } from '@nestjs/common';
import { WebScrapingController } from './controllers/web-scraping.controller';
import { IWebScrapingService } from './interfaces/web-scraping.interface';
import { WebScrapingService } from './services/web-scraping.service';
import { Doc, DocContent } from 'src/database/typeorm/entities';
import { FirecrawlService } from 'src/gateways/firecrawl';
import FirecrawlApp from '@mendable/firecrawl-js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MongooseModule } from '@nestjs/mongoose';
import forFeatureDb from 'src/database/mongoose/for-feature.db';
import { customLangChainProvider } from '../langchain/langchain.provider';
import { customOpenAiProvider } from '../openai/openai.provider';

@Module({
  imports: [
    TypeOrmModule.forFeature([Doc, DocContent]),
    MongooseModule.forFeature(forFeatureDb),
  ],
  controllers: [WebScrapingController],
  providers: [
    customLangChainProvider,
    customOpenAiProvider,
    { provide: IWebScrapingService, useClass: WebScrapingService },
    {
      provide: FirecrawlService,
      useFactory: () => {
        const firecrawlApp = new FirecrawlApp({
          apiKey: process.env.FIRECRAWL_KEY,
        });

        return new FirecrawlService(firecrawlApp);
      },
    },
  ],
})
export class WebScrapingModule {}
