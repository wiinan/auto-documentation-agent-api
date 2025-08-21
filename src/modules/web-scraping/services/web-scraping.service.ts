import { Injectable, NotFoundException } from '@nestjs/common';
import { IWebScrapingService } from '../interfaces/web-scraping.interface';
import { DataSource } from 'typeorm';
import { Doc } from 'src/database/typeorm/entities';
import { FirecrawlService } from 'src/gateways/firecrawl';
import { ScrapCrawResponseDto, ScrapDataDto } from '../web-scraping.dto';
import { first } from 'lodash';
import { DocContent } from 'src/database/typeorm/entities/doc-content.entity';
import { DOC_STATUS } from 'src/constants/agent';
import { LangChainService } from 'src/modules/langchain/langchain.service';
import { OpenAiAgentService } from 'src/gateways/openai';
import { Utils } from 'src/helpers/utils';

@Injectable()
export class WebScrapingService implements IWebScrapingService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly firecrawlService: FirecrawlService,
    private readonly langChainService: LangChainService,
    private readonly openAiAgentService: OpenAiAgentService,
  ) {}

  private async saveDocs(scrapingData: ScrapDataDto[], items: string[]) {
    const metaData = first(scrapingData)?.metadata;

    await this.dataSource.transaction(async (entityManager) => {
      const docContentItems: Partial<DocContent>[] = [];
      const docData = await entityManager.save(Doc, {
        name: metaData?.title,
        link: metaData?.sourceURL,
        status: DOC_STATUS.OPEN,
      });

      for (const content of items) {
        const embedding =
          await this.openAiAgentService.createEmbedding(content);

        docContentItems.push({
          content,
          embedding: Utils.parseEmbeddingsToVectorQuery(embedding),
          docId: docData.id,
          link: metaData?.sourceURL,
        });
      }

      await entityManager
        .createQueryBuilder()
        .insert()
        .into(DocContent)
        .values(docContentItems)
        .execute();
    });
  }

  private async spliterScrapingContent(
    scrapingData: ScrapDataDto[],
  ): Promise<string[]> {
    const items: string[] = [];

    for (const item of scrapingData) {
      const documentSpliter = await this.langChainService.textSpliter(
        item.markdown || '',
      );

      items.push(...documentSpliter);
    }

    return items;
  }

  async saveDocAction(url: string): Promise<boolean> {
    const scrapingData =
      await this.firecrawlService.getDocContent<ScrapCrawResponseDto>(url);

    if (!scrapingData.data?.length) {
      throw new NotFoundException('NO_DOCUMENT_FOUND');
    }

    const items: string[] = await this.spliterScrapingContent(
      scrapingData.data,
    );

    await this.saveDocs(scrapingData.data, items);

    return true;
  }

  async listWebScrapingDocs(): Promise<Doc[]> {
    return this.dataSource.getRepository(Doc).find({
      where: { isDeleted: false },
    });
  }
}
