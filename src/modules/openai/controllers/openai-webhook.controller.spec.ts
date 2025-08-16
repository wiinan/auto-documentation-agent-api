/* eslint-disable @typescript-eslint/unbound-method */
// openai-webhook.controller.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { OpenAiWebhookController } from './openai-webhook.controller';
import { IOpenAiWebHookService } from '../interfaces/openai-webhook.interface';
import { WebhookResponseDto } from '../openai.dto';

describe('OpenAiWebhookController', () => {
  let controller: OpenAiWebhookController;
  let service: IOpenAiWebHookService;

  beforeEach(async () => {
    const mockService = {
      updateModelAction: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [OpenAiWebhookController],
      providers: [
        {
          provide: IOpenAiWebHookService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<OpenAiWebhookController>(OpenAiWebhookController);
    service = module.get<IOpenAiWebHookService>(IOpenAiWebHookService);
  });

  it('deve chamar updateModelAction do serviço com os dados recebidos', async () => {
    const dto: WebhookResponseDto = {
      object: 'object',
      id: '123',
      type: 'fine_tuning.job.succeeded',
      created_at: 12312312,
      data: { id: '321', fine_tuned_model: 'ogpt-3' },
    };
    (service.updateModelAction as jest.Mock).mockResolvedValue(true);

    const result = await controller.getMessagesAction(dto);

    expect(service.updateModelAction).toHaveBeenCalledWith(dto);
    expect(result).toBe(true);
  });

  it('deve retornar false se o serviço retornar false', async () => {
    const dto: WebhookResponseDto = {
      object: 'object',
      id: '123',
      type: 'fine_tuning.job.failed',
      created_at: 12312312,
      data: { id: '321', fine_tuned_model: 'ogpt-3' },
    };
    (service.updateModelAction as jest.Mock).mockResolvedValue(false);

    const result = await controller.getMessagesAction(dto);

    expect(service.updateModelAction).toHaveBeenCalledWith(dto);
    expect(result).toBe(false);
  });
});
