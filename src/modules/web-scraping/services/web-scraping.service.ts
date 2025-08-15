import { Injectable, NotFoundException } from '@nestjs/common';
import { IWebScrapingService } from '../interfaces/web-scraping.interface';
import { DataSource } from 'typeorm';
import { Doc } from 'src/database/typeorm/entities';
import { FirecrawlService } from 'src/gateways/firecrawl';
import { ScrapCrawResponseDto } from '../web-scraping.dto';
import { first } from 'lodash';
import { DocContent } from 'src/database/typeorm/entities/doc-content.entity';
import { DOC_STATUS } from 'src/constants/agent';

@Injectable()
export class WebScrapingService implements IWebScrapingService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly firecrawlService: FirecrawlService,
  ) {}

  async saveDocAction(url: string): Promise<boolean> {
    const scrapingData =
      await this.firecrawlService.getDocContent<ScrapCrawResponseDto>(url);

    if (!scrapingData.data?.length) {
      throw new NotFoundException('NO_DOCUMENT_FOUND');
    }

    const metaData = first(scrapingData.data)?.metadata;

    await this.dataSource.transaction(async (entityManager) => {
      const docData = await entityManager.save(Doc, {
        name: metaData?.title,
        link: metaData?.sourceURL,
        status: DOC_STATUS.OPEN,
      });

      if (!scrapingData.data) {
        return;
      }

      const docContentItems = scrapingData.data.map((scrap) => ({
        docId: docData.id,
        content: scrap.markdown,
        link: scrap.metadata?.sourceURL,
      }));

      await entityManager
        .createQueryBuilder()
        .insert()
        .into(DocContent)
        .values(docContentItems)
        .execute();
    });

    return true;
  }

  async listWebScrapingDocs(): Promise<Doc[]> {
    return this.dataSource.getRepository(Doc).find({
      where: { isDeleted: false },
    });
  }
}
