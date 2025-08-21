import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import OpenAI from 'openai';
import { OpenAiAgentService } from './openai';

describe('OpenAiAgentService', () => {
  process.env.OPENAI_MODEL = 'gpt-3.5-turbo';

  let service: OpenAiAgentService;
  let mockCreate: jest.Mock;

  beforeEach(async () => {
    mockCreate = jest.fn();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OpenAiAgentService,
        {
          provide: OpenAI,
          useValue: {
            completions: { create: mockCreate },
          },
        },
      ],
    }).compile();

    service = module.get<OpenAiAgentService>(OpenAiAgentService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('talk', () => {
    it('deve retornar resposta do OpenAI quando sucesso', async () => {
      const fakeResponse = { output: 'Hello World' };
      mockCreate.mockResolvedValue(fakeResponse);

      const result = await service.talk('Oi');

      expect(mockCreate).toHaveBeenCalledWith({
        model: process.env.OPENAI_MODEL,
        prompt: 'Oi',
        temperature: 0.2,
        top_p: 1,
        max_tokens: 4000,
      });
      expect(result).toBe(fakeResponse);
    });

    it('deve lançar BadRequestException quando ocorrer erro', async () => {
      mockCreate.mockRejectedValue(new Error('Erro API'));

      await expect(service.talk('Oi')).rejects.toThrow(
        new BadRequestException('OpenAiAgentService.talk ERROR'),
      );

      expect(mockCreate).toHaveBeenCalled();
    });
  });
});
