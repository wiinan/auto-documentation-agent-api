/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { OpenAiService } from './openai.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { getModelToken } from '@nestjs/mongoose';
import { Message } from 'src/database/mongoose/schemas/message.schema';
import { OpenAiAgentService } from 'src/gateways/openai';
import { Doc } from 'src/database/typeorm/entities';
import { Utils } from 'src/helpers/utils';
import {
  CHAT_ROLES,
  DEFAULT_NOT_FOUND_AGENT_MESSAGE,
  DOC_STATUS,
} from 'src/constants/agent';
import { Completion, CompletionChoice } from 'openai/resources';

describe('OpenAiService', () => {
  let service: OpenAiService;
  let docRepo: jest.Mocked<Repository<Doc>>;
  let dataSource: { query: jest.Mock };
  let messageModel: {
    create: jest.Mock;
    find: jest.Mock;
    sort: jest.Mock;
    exec: jest.Mock;
  };
  let agentService: jest.Mocked<OpenAiAgentService>;

  const MOCKED_DOC_DATA = {
    id: 1,
    name: 'test doc',
    modelName: 'gpt-test',
    link: 'mock-doc.com',
    status: DOC_STATUS.OPEN,
    fineTuneJobId: '',
    createdAt: new Date(),
    updatedAt: new Date(),
    isDeleted: false,
    docContent: [],
  };
  const MOCKED_CHOICES_DATA: CompletionChoice[] = [
    {
      text: 'resposta final',
      finish_reason: 'stop',
      index: 0,
      logprobs: null,
    },
  ];
  const MOCKED_COMPLETIONS_DATA: Completion = {
    id: '1',
    created: 12344321,
    model: 'gpt-4',
    object: 'text_completion',
    choices: [],
  };

  beforeEach(async () => {
    docRepo = {
      find: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
    } as any;

    dataSource = {
      query: jest.fn(),
    };

    messageModel = {
      create: jest.fn(),
      find: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnThis(),
      exec: jest.fn(),
    };

    agentService = {
      fineTuneAction: jest.fn(),
      createEmbedding: jest.fn(),
      talk: jest.fn(),
    } as any;

    jest.spyOn(Utils, 'mountFineTuneData').mockReturnValue([
      {
        messages: [
          {
            role: 'system',
            content: `Você é um especialista em uma documentação.`,
          },
          {
            role: 'user',
            content: 'Faça um resumo do conteudo.',
          },
          {
            role: 'assistant',
            content: 'doc teste',
          },
        ],
      },
    ]);
    jest.spyOn(Utils, 'createFineTuneFile').mockReturnValue('/tmp/file.jsonl');
    jest
      .spyOn(Utils, 'parseEmbeddingsToVectorQuery')
      .mockReturnValue('[1,2,3]');

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OpenAiService,
        { provide: getRepositoryToken(Doc), useValue: docRepo },
        { provide: DataSource, useValue: dataSource },
        { provide: getModelToken(Message.name), useValue: messageModel },
        { provide: OpenAiAgentService, useValue: agentService },
      ],
    }).compile();

    service = module.get<OpenAiService>(OpenAiService);
  });

  describe('trainingAgentAction', () => {
    it('deve processar docs abertos e iniciar fine-tune', async () => {
      docRepo.find.mockResolvedValue([
        { id: 1, name: 'doc1', docContent: [{ content: 'abc' }] },
      ] as Doc[]);

      agentService.fineTuneAction.mockResolvedValue({ id: 'job-123' });

      await service.trainingAgentAction();

      expect(Utils.mountFineTuneData).toHaveBeenCalled();
      expect(Utils.createFineTuneFile).toHaveBeenCalledWith(1, [
        {
          messages: [
            {
              content: 'Você é um especialista em uma documentação.',
              role: 'system',
            },
            { content: 'Faça um resumo do conteudo.', role: 'user' },
            { content: 'doc teste', role: 'assistant' },
          ],
        },
      ]);
      expect(agentService.fineTuneAction).toHaveBeenCalledWith(
        '/tmp/file.jsonl',
      );
      expect(docRepo.update).toHaveBeenCalledWith(1, {
        fineTuneJobId: 'job-123',
        status: DOC_STATUS.PROCESSING,
      });
    });
  });

  describe('talkToAgent', () => {
    it('deve retornar mensagem padrão se doc não encontrado', async () => {
      docRepo.findOne.mockResolvedValue(null);

      const result = await service.talkToAgent({ docId: 99, text: 'Pergunta' });

      expect(result).toBe(DEFAULT_NOT_FOUND_AGENT_MESSAGE);
    });

    it('deve gerar embedding, buscar conteúdo e responder', async () => {
      docRepo.findOne.mockResolvedValue(MOCKED_DOC_DATA);
      agentService.createEmbedding.mockResolvedValue([0.1, 0.2, 0.3]);
      dataSource.query.mockResolvedValue([{ id: 1, content: 'conteúdo doc' }]);
      agentService.talk.mockResolvedValue({
        ...MOCKED_COMPLETIONS_DATA,
        choices: MOCKED_CHOICES_DATA,
      });

      const result = await service.talkToAgent({
        docId: 1,
        text: 'Qual é a info?',
      });

      expect(agentService.createEmbedding).toHaveBeenCalledWith(
        'Qual é a info?',
      );
      expect(dataSource.query).toHaveBeenCalled();
      expect(agentService.talk).toHaveBeenCalledWith(
        expect.stringContaining('conteúdo doc'),
        'gpt-test',
      );
      expect(messageModel.create).toHaveBeenCalledWith(
        expect.objectContaining({ type: CHAT_ROLES.USER }),
      );
      expect(messageModel.create).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'resposta final',
          type: CHAT_ROLES.AGENT,
        }),
      );
      expect(result).toBe('resposta final');
    });

    it('deve retornar mensagem padrão se talk não tiver resposta', async () => {
      docRepo.findOne.mockResolvedValue(MOCKED_DOC_DATA);
      agentService.createEmbedding.mockResolvedValue([0.1, 0.2, 0.3]);
      dataSource.query.mockResolvedValue([{ id: 1, content: 'conteúdo doc' }]);
      agentService.talk.mockResolvedValue(MOCKED_COMPLETIONS_DATA);

      const result = await service.talkToAgent({
        docId: 1,
        text: 'Teste sem resposta',
      });

      expect(result).toBe(DEFAULT_NOT_FOUND_AGENT_MESSAGE);
    });
  });

  describe('getMessages', () => {
    it('deve retornar mensagens ordenadas', async () => {
      const msgs = [{ message: 'msg1' }, { message: 'msg2' }];
      messageModel.exec.mockResolvedValue(msgs);

      const result = await service.getMessages();

      expect(messageModel.find).toHaveBeenCalled();
      expect(messageModel.sort).toHaveBeenCalledWith({ createdAt: 1 });
      expect(result).toEqual(msgs);
    });
  });
});
