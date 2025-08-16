/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { OpenAiWebHookService } from './openai-webhook.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Doc } from 'src/database/typeorm/entities';
import { Repository } from 'typeorm';
import { BadRequestException } from '@nestjs/common';
import { WEBHOOK_EVENT_STATUS } from 'src/constants/agent';

describe('OpenAiWebHookService', () => {
  let service: OpenAiWebHookService;
  let docRepository: jest.Mocked<Repository<Doc>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OpenAiWebHookService,
        {
          provide: getRepositoryToken(Doc),
          useValue: {
            findOne: jest.fn(),
            update: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<OpenAiWebHookService>(OpenAiWebHookService);
    docRepository = module.get(getRepositoryToken(Doc));
  });

  describe('updateModelAction', () => {
    const payload = {
      object: 'fine_tune.job',
      created_at: 1700000000,
      id: 'job-123',
      type: 'fine_tuning.job.succeeded',
      data: { id: 'ft:312', fine_tuned_model: 'ft:gpt-3.5:custom-model' },
    };

    it('deve atualizar o modelo quando o doc existe', async () => {
      docRepository.findOne.mockResolvedValue({ id: 1 } as Doc);

      await expect(service.updateModelAction(payload)).resolves.toBe(true);

      expect(docRepository.findOne).toHaveBeenCalledWith({
        where: { fineTuneJobId: payload.id },
        select: ['id'],
      });

      const status = WEBHOOK_EVENT_STATUS[payload.type] as WEBHOOK_EVENT_STATUS;

      expect(docRepository.update).toHaveBeenCalledWith(1, {
        modelName: payload.data.fine_tuned_model,
        status,
      });
    });

    it('deve lançar erro quando o doc não for encontrado', async () => {
      docRepository.findOne.mockResolvedValue(null);

      await expect(service.updateModelAction(payload)).rejects.toThrow(
        BadRequestException,
      );

      expect(docRepository.update).not.toHaveBeenCalled();
    });
  });
});
