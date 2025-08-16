// openai.controller.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { OpenAiController } from './openai.controller';
import { IOpenAiService } from '../interfaces/openai.interface';
import { Message } from 'src/database/mongoose/schemas/message.schema';

describe('OpenAiController', () => {
  let controller: OpenAiController;
  let service: IOpenAiService;

  beforeEach(async () => {
    const mockService = {
      getMessages: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [OpenAiController],
      providers: [
        {
          provide: IOpenAiService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<OpenAiController>(OpenAiController);
    service = module.get<IOpenAiService>(IOpenAiService);
  });

  it('deve retornar mensagens do serviço', async () => {
    const mockMessages: Message[] = [
      { type: 'user', message: 'Olá', status: 'sent' },
      { type: 'assistant', message: 'Oi, tudo bem?', status: 'sent' },
    ];
    (service.getMessages as jest.Mock).mockResolvedValue(mockMessages);

    const result = await controller.getMessagesAction();

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(service.getMessages).toHaveBeenCalled();
    expect(result).toEqual(mockMessages);
  });
});
