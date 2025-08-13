import { Module } from '@nestjs/common';
import { WebScrapingController } from './controllers/web-scraping.controller';
import { IWebScrapingService } from './interfaces/web-scraping.interface';
import { WebScrapingService } from './services/web-scraping.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Doc, DocContent } from 'src/database/entities';
import { FirecrawlService } from 'src/gateways/firecrawl';
import { OpenAiAgentService } from 'src/gateways/openai';

@Module({
  imports: [TypeOrmModule.forFeature([Doc, DocContent])],
  controllers: [WebScrapingController],
  providers: [
    { provide: IWebScrapingService, useClass: WebScrapingService },
    FirecrawlService,
    OpenAiAgentService,
  ],
})
export class WebScrapingModule {}
