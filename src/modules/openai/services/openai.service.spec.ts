/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { getModelToken } from '@nestjs/mongoose';
import { Repository } from 'typeorm';
import { Model } from 'mongoose';
import { OpenAiService } from './openai.service';
import { Doc, DocContent } from 'src/database/typeorm/entities';
import { Message } from 'src/database/mongoose/schemas/message.schema';
import { OpenAiAgentService } from 'src/gateways/openai';
import { Utils } from 'src/helpers/utils';
import {
  CHAT_ROLES,
  CHAT_STATUS,
  DEFAULT_NOT_FOUND_AGENT_MESSAGE,
  DOC_STATUS,
} from 'src/constants/agent';
import OpenAI from 'openai';

jest.mock('src/helpers/utils');

describe('OpenAiService', () => {
  let service: OpenAiService;
  let docRepository: jest.Mocked<Repository<Doc>>;
  let messageModel: jest.Mocked<Model<Message>>;
  let openAiAgentService: jest.Mocked<OpenAiAgentService>;

  const fineTuneResponse: OpenAI.FineTuning.Jobs.FineTuningJob = {
    finished_at: null,
    object: 'fine_tuning.job',
    id: 'ftjob-abc123',
    model: 'gpt-4o-mini-2024-07-18',
    created_at: 1721764800,
    fine_tuned_model: null,
    organization_id: 'org-123',
    result_files: [],
    error: null,
    status: 'queued',
    validation_file: null,
    training_file: 'file-abc123',
    hyperparameters: {
      batch_size: 'auto',
      learning_rate_multiplier: 'auto',
      n_epochs: 'auto',
    },
    seed: 683058546,
    trained_tokens: null,
    estimated_finish: null,
    integrations: [],
  };

  const completionsResponse: OpenAI.Completions.Completion = {
    id: 'chatcmpl-abc123',
    created: 1699896916,
    model: 'gpt-4o-mini',
    object: 'text_completion',
    choices: [],
    usage: {
      prompt_tokens: 82,
      completion_tokens: 17,
      total_tokens: 99,
      completion_tokens_details: {
        reasoning_tokens: 0,
        accepted_prediction_tokens: 0,
        rejected_prediction_tokens: 0,
      },
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OpenAiService,
        {
          provide: getRepositoryToken(Doc),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(DocContent),
          useValue: {},
        },
        {
          provide: getModelToken(Message.name),
          useValue: {
            create: jest.fn(),
            find: jest.fn().mockReturnThis(),
            sort: jest.fn().mockReturnThis(),
            exec: jest.fn(),
          },
        },
        {
          provide: OpenAiAgentService,
          useValue: {
            fineTuneAction: jest.fn(),
            talk: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<OpenAiService>(OpenAiService);
    docRepository = module.get(getRepositoryToken(Doc));
    messageModel = module.get(getModelToken(Message.name));
    openAiAgentService = module.get(OpenAiAgentService);
  });

  describe('trainingAgentAction', () => {
    it('deve treinar agentes quando docs encontrados', async () => {
      const mockDocs = [
        { id: 1, name: 'Doc1', docContent: [{ content: 'abc' }] } as Doc,
      ];
      docRepository.find.mockResolvedValue(mockDocs);

      (Utils.mountFineTuneData as jest.Mock).mockReturnValue('data');
      (Utils.createFineTuneFile as jest.Mock).mockReturnValue('filePath');
      openAiAgentService.fineTuneAction.mockResolvedValue(fineTuneResponse);

      await service.trainingAgentAction();

      expect(Utils.mountFineTuneData).toHaveBeenCalledWith(
        mockDocs[0].docContent,
        mockDocs[0].name,
      );
      expect(Utils.createFineTuneFile).toHaveBeenCalledWith(1, 'data');
      expect(openAiAgentService.fineTuneAction).toHaveBeenCalledWith(
        'filePath',
      );
      expect(docRepository.update).toHaveBeenCalledWith(1, {
        fineTuneJobId: 'ftjob-abc123',
        status: DOC_STATUS.PROCESSING,
      });
    });

    it('não deve treinar quando nenhum doc encontrado', async () => {
      docRepository.find.mockResolvedValue([]);
      await service.trainingAgentAction();
      expect(openAiAgentService.fineTuneAction).not.toHaveBeenCalled();
      expect(docRepository.update).not.toHaveBeenCalled();
    });
  });

  describe('talkToAgent', () => {
    const mockPayload = { docId: 1, text: 'Qual é a política?' };

    it('deve retornar mensagem padrão se doc não encontrado', async () => {
      docRepository.findOne.mockResolvedValue(null);

      const result = await service.talkToAgent(mockPayload);

      expect(result).toBe(DEFAULT_NOT_FOUND_AGENT_MESSAGE);
    });

    it('deve retornar mensagem padrão se não houver resposta do agente', async () => {
      docRepository.findOne.mockResolvedValue({
        id: 1,
        modelName: 'ft-model',
        docContent: [{ content: 'doc text' }],
      } as Doc);

      openAiAgentService.talk.mockResolvedValue(completionsResponse);

      const result = await service.talkToAgent(mockPayload);

      expect(result).toBe(DEFAULT_NOT_FOUND_AGENT_MESSAGE);
      expect(messageModel.create).toHaveBeenCalledWith({
        message: mockPayload.text,
        status: CHAT_STATUS.SEND,
        type: CHAT_ROLES.USER,
      });
    });

    it('deve retornar resposta válida do agente', async () => {
      docRepository.findOne.mockResolvedValue({
        id: 1,
        modelName: 'ft-model',
        docContent: [{ content: 'doc text' }],
      } as Doc);

      openAiAgentService.talk.mockResolvedValue({
        ...completionsResponse,
        choices: [
          {
            text: 'Resposta da IA',
            logprobs: null,
            finish_reason: 'stop',
            index: 0,
          },
        ],
      });

      const result = await service.talkToAgent(mockPayload);

      expect(result).toBe('Resposta da IA');
      expect(messageModel.create).toHaveBeenCalledWith({
        message: mockPayload.text,
        status: CHAT_STATUS.SEND,
        type: CHAT_ROLES.USER,
      });
      expect(messageModel.create).toHaveBeenCalledWith({
        message: 'Resposta da IA',
        status: CHAT_STATUS.SEND,
        type: CHAT_ROLES.AGENT,
      });
    });
  });

  describe('getMessages', () => {
    it('deve retornar mensagens ordenadas', async () => {
      const mockMessages: Message[] = [];
      messageModel.find.mockResolvedValue(mockMessages).mockReturnThis();

      const result = await service.getMessages();

      expect(messageModel.find).toHaveBeenCalled();
      expect(messageModel.find().sort).toHaveBeenCalled();
      expect(result).toEqual(undefined);
    });
  });
});
