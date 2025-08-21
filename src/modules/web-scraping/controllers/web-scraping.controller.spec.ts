/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { WebScrapingController } from './web-scraping.controller';
import { IWebScrapingService } from '../interfaces/web-scraping.interface';
import { Doc } from 'src/database/typeorm/entities';

describe('WebScrapingController', () => {
  let controller: WebScrapingController;
  let webScrapingService: jest.Mocked<IWebScrapingService>;

  beforeEach(async () => {
    webScrapingService = {
      saveDocAction: jest.fn(),
      listWebScrapingDocs: jest.fn(),
    } as unknown as jest.Mocked<IWebScrapingService>;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [WebScrapingController],
      providers: [
        { provide: IWebScrapingService, useValue: webScrapingService },
      ],
    }).compile();

    controller = module.get<WebScrapingController>(WebScrapingController);
  });

  describe('saveDocumentationUrl', () => {
    it('deve salvar a URL de documentação e retornar true', async () => {
      webScrapingService.saveDocAction.mockResolvedValue(true);

      const result = await controller.saveDocumentationUrl({
        url: 'https://docs.nestjs.com/',
      });

      expect(webScrapingService.saveDocAction).toHaveBeenCalledWith(
        'https://docs.nestjs.com/',
      );
      expect(result).toBe(true);
    });

    it('deve retornar false caso o service retorne false', async () => {
      webScrapingService.saveDocAction.mockResolvedValue(false);

      const result = await controller.saveDocumentationUrl({
        url: 'https://fake-url.com/',
      });

      expect(webScrapingService.saveDocAction).toHaveBeenCalledWith(
        'https://fake-url.com/',
      );
      expect(result).toBe(false);
    });
  });

  describe('listWebScrapingDocsAction', () => {
    it('deve retornar lista de documentos', async () => {
      const docs: Partial<Doc>[] = [
        { id: 1, name: 'Doc NestJS' },
        { id: 2, name: 'Doc Angular' },
      ];

      webScrapingService.listWebScrapingDocs.mockResolvedValue(docs as Doc[]);

      const result = await controller.listWebScrapingDocsAction();

      expect(webScrapingService.listWebScrapingDocs).toHaveBeenCalled();
      expect(result).toEqual(docs);
    });
  });
});
