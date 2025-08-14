/* eslint-disable @typescript-eslint/unbound-method */
// firecrawl.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import FirecrawlApp, { CrawlStatusResponse } from '@mendable/firecrawl-js';
import { FirecrawlService } from './firecrawl';

describe('FirecrawlService', () => {
  let service: FirecrawlService;
  let firecrawlMock: jest.Mocked<FirecrawlApp>;

  beforeEach(async () => {
    firecrawlMock = {
      crawlUrl: jest.fn(),
    } as unknown as jest.Mocked<FirecrawlApp>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FirecrawlService,
        {
          provide: FirecrawlApp,
          useValue: firecrawlMock,
        },
      ],
    }).compile();

    service = module.get<FirecrawlService>(FirecrawlService);
  });

  it('deve retornar o conteúdo do documento quando a URL é válida', async () => {
    const mockResponse: CrawlStatusResponse = {
      success: true,
      status: 'completed',
      completed: 1,
      total: 1,
      creditsUsed: 1,
      expiresAt: new Date(),
      data: [],
    };
    firecrawlMock.crawlUrl.mockResolvedValueOnce(mockResponse);

    const result =
      await service.getDocContent<typeof mockResponse>('http://exemplo.com');
    expect(result).toEqual(mockResponse);
    expect(firecrawlMock.crawlUrl).toHaveBeenCalledWith('http://exemplo.com');
  });

  it('deve lançar BadRequestException se a URL não for informada', async () => {
    await expect(service.getDocContent('')).rejects.toThrow(
      BadRequestException,
    );
    expect(firecrawlMock.crawlUrl).not.toHaveBeenCalled();
  });

  it('deve propagar o erro se o Firecrawl falhar', async () => {
    firecrawlMock.crawlUrl.mockRejectedValueOnce(
      new Error('INVALID_URL_PARAMS'),
    );

    await expect(service.getDocContent('http://exemplo.com')).rejects.toThrow(
      'INVALID_URL_PARAMS',
    );
    expect(firecrawlMock.crawlUrl).toHaveBeenCalledWith('http://exemplo.com');
  });
});
