import { Module } from '@nestjs/common';
import { WebScrapingController } from './controllers/web-scraping.controller';
import { IWebScrapingService } from './interfaces/web-scraping.interface';
import { WebScrapingService } from './services/web-scraping.service';
import { Doc, DocContent } from 'src/database/typeorm/entities';
import { FirecrawlService } from 'src/gateways/firecrawl';
import FirecrawlApp from '@mendable/firecrawl-js';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Doc, DocContent])],
  controllers: [WebScrapingController],
  providers: [
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
