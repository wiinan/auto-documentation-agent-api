/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { LangChainService } from './langchain.service';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { Document } from '@langchain/core/documents';

describe('LangChainService', () => {
  let service: LangChainService;
  let textSplitter: jest.Mocked<RecursiveCharacterTextSplitter>;

  beforeEach(async () => {
    textSplitter = {
      splitDocuments: jest.fn(),
    } as unknown as jest.Mocked<RecursiveCharacterTextSplitter>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LangChainService,
        { provide: RecursiveCharacterTextSplitter, useValue: textSplitter },
      ],
    }).compile();

    service = module.get<LangChainService>(LangChainService);
  });

  it('deve chamar splitDocuments com o Document correto', async () => {
    const text = 'Texto de teste';
    textSplitter.splitDocuments.mockResolvedValue([
      new Document({ pageContent: 'parte1' }),
      new Document({ pageContent: 'parte2' }),
    ]);

    const result = await service.textSpliter(text);

    expect(textSplitter.splitDocuments).toHaveBeenCalledWith([
      expect.any(Document),
    ]);
    expect(result).toEqual(['parte1', 'parte2']);
  });

  it('deve retornar array vazio se splitDocuments não retornar nada', async () => {
    textSplitter.splitDocuments.mockResolvedValue([]);

    const result = await service.textSpliter('qualquer coisa');

    expect(result).toEqual([]);
  });

  it('deve lidar com texto vazio', async () => {
    textSplitter.splitDocuments.mockResolvedValue([
      new Document({ pageContent: '' }),
    ]);

    const result = await service.textSpliter('');

    expect(result).toEqual(['']);
  });
});
