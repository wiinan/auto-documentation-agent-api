/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { WebScrapingService } from './web-scraping.service';
import { DataSource } from 'typeorm';
import { FirecrawlService } from 'src/gateways/firecrawl';
import { LangChainService } from 'src/modules/langchain/langchain.service';
import { OpenAiAgentService } from 'src/gateways/openai';
import { NotFoundException } from '@nestjs/common';
import { Doc } from 'src/database/typeorm/entities';
import { ScrapCrawResponseDto } from '../web-scraping.dto';
import { Utils } from 'src/helpers/utils';
import { DOC_STATUS } from 'src/constants/agent';

describe('WebScrapingService', () => {
  let service: WebScrapingService;
  let dataSource: jest.Mocked<DataSource>;
  let firecrawlService: jest.Mocked<FirecrawlService>;
  let langChainService: jest.Mocked<LangChainService>;
  let openAiAgentService: jest.Mocked<OpenAiAgentService>;

  beforeEach(async () => {
    dataSource = {
      createQueryRunner: jest.fn().mockReturnValue({
        connect: jest.fn(),
        startTransaction: jest.fn(),
        commitTransaction: jest.fn(),
        rollbackTransaction: jest.fn(),
        release: jest.fn(),
        manager: {
          save: jest.fn().mockResolvedValue({ id: 1 }),
          createQueryBuilder: jest.fn().mockReturnValue({
            insert: jest.fn().mockReturnThis(),
            into: jest.fn().mockReturnThis(),
            values: jest.fn().mockReturnThis(),
            execute: jest.fn().mockResolvedValue({}),
          }),
        },
      }),
      getRepository: jest.fn().mockReturnValue({
        find: jest
          .fn()
          .mockResolvedValue([{ id: 1, name: 'doc', isDeleted: false }]),
      }),
    } as unknown as jest.Mocked<DataSource>;

    firecrawlService = {
      getDocContent: jest.fn(),
    } as unknown as jest.Mocked<FirecrawlService>;

    langChainService = {
      textSpliter: jest.fn(),
    } as unknown as jest.Mocked<LangChainService>;

    openAiAgentService = {
      createEmbedding: jest.fn(),
    } as unknown as jest.Mocked<OpenAiAgentService>;

    jest
      .spyOn(Utils, 'parseEmbeddingsToVectorQuery')
      .mockReturnValue('[1,2,3]');

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WebScrapingService,
        { provide: DataSource, useValue: dataSource },
        { provide: FirecrawlService, useValue: firecrawlService },
        { provide: LangChainService, useValue: langChainService },
        { provide: OpenAiAgentService, useValue: openAiAgentService },
      ],
    }).compile();

    service = module.get<WebScrapingService>(WebScrapingService);
  });

  describe('saveDocAction', () => {
    it('deve lançar NotFoundException se não encontrar documentos', async () => {
      firecrawlService.getDocContent.mockResolvedValue({ data: [] });

      await expect(
        service.saveDocAction('http://fake-url.com'),
      ).rejects.toThrow(NotFoundException);
    });

    it('deve processar scrapingData, dividir conteúdo e salvar docs', async () => {
      const scrapingData: ScrapCrawResponseDto = {
        success: true,
        data: [
          {
            metadata: { title: 'Doc Teste', sourceURL: 'http://site.com' },
            markdown: '# Conteúdo',
            sourceURL: '',
          },
        ],
        actions: [] as never,
      };

      firecrawlService.getDocContent.mockResolvedValue(scrapingData);
      langChainService.textSpliter.mockResolvedValue(['parte1', 'parte2']);
      openAiAgentService.createEmbedding.mockResolvedValue([0.5, 0.6]);

      const result = await service.saveDocAction('http://test.com');

      expect(result).toBe(true);
      expect(openAiAgentService.createEmbedding).toHaveBeenCalledWith('parte1');
      expect(openAiAgentService.createEmbedding).toHaveBeenCalledWith('parte2');
    });
  });

  describe('listWebScrapingDocs', () => {
    it('deve retornar lista de documentos não deletados', async () => {
      const docs: Doc[] = [
        {
          id: 1,
          name: 'Doc NestJS',
          status: DOC_STATUS.OPEN,
          modelName: '',
          link: '',
          fineTuneJobId: '',
          createdAt: new Date(),
          updatedAt: new Date(),
          isDeleted: false,
          docContent: [],
        },
      ];
      dataSource.getRepository(Doc).find = jest.fn().mockResolvedValue(docs);
      const result = await service.listWebScrapingDocs();

      expect(dataSource.getRepository).toHaveBeenCalledWith(Doc);
      expect(result).toEqual(docs);
    });
  });
});
