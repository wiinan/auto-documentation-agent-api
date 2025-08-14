/* eslint-disable @typescript-eslint/unbound-method */
// openai-chat.gateway.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { OpenAiChatGateway } from './openai-chat';
import { IOpenAiService } from 'src/modules/openai/interfaces/openai.interface';

describe('OpenAiChatGateway', () => {
  let gateway: OpenAiChatGateway;
  let openAiServiceMock: jest.Mocked<IOpenAiService>;
  let serverMock: jest.Mocked<Server>;

  beforeEach(async () => {
    openAiServiceMock = {
      talkToAgent: jest.fn(),
    } as unknown as jest.Mocked<IOpenAiService>;

    serverMock = {
      emit: jest.fn(),
    } as unknown as jest.Mocked<Server>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OpenAiChatGateway,
        {
          provide: IOpenAiService,
          useValue: openAiServiceMock,
        },
      ],
    })
      .overrideProvider(IOpenAiService)
      .useValue(openAiServiceMock)
      .compile();

    gateway = module.get<OpenAiChatGateway>(OpenAiChatGateway);
    gateway.server = serverMock;

    jest.spyOn(Logger.prototype, 'log').mockImplementation();
  });

  describe('handleConnection', () => {
    it('deve logar e emitir evento de user-joined', () => {
      const clientMock = { id: '123' } as Socket;

      gateway.handleConnection(clientMock);

      expect(Logger.prototype.log).toHaveBeenCalledWith(
        'Client connected: 123',
      );
      expect(serverMock.emit).toHaveBeenCalledWith('user-joined', {
        message: 'User joined the chat',
        clientId: '123',
      });
    });
  });

  describe('handleDisconnect', () => {
    it('deve emitir evento de user-left', () => {
      const clientMock = { id: '456' } as Socket;

      jest.spyOn(console, 'log').mockImplementation();

      gateway.handleDisconnect(clientMock);

      expect(serverMock.emit).toHaveBeenCalledWith('user-left', {
        message: 'User left the chat: 456',
        clientId: '456',
      });
    });
  });

  describe('handleNewMessage', () => {
    it('deve chamar openAiService.talkToAgent e emitir resposta', async () => {
      const fakeData = {
        docId: 1,
        text: 'hello',
      };
      const fakeResponse = 'hello';

      openAiServiceMock.talkToAgent.mockResolvedValueOnce(fakeResponse);

      await gateway.handleNewMessage(fakeData);

      expect(openAiServiceMock.talkToAgent).toHaveBeenCalledWith(fakeData);
      expect(serverMock.emit).toHaveBeenCalledWith('openaiChat', fakeResponse);
    });
  });
});
