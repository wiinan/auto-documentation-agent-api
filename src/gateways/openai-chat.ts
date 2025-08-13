import { Logger } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ZodValidationPipe } from 'src/middlewares/validator.pipe';
import { IOpenAiService } from 'src/modules/openai/interfaces/openai.interface';
import { talkWithAgentSchema } from 'src/modules/openai/openai.schema';
import z from 'zod';

@WebSocketGateway({ cors: { origin: '*' } })
export class OpenAiChatGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;
  private logger: Logger = new Logger('ChatGateway');

  constructor(private readonly openAiService: IOpenAiService) {}

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);

    this.server.emit('user-joined', {
      message: `User joined the chat`,
      clientId: client.id,
    });
  }

  handleDisconnect(@ConnectedSocket() client: Socket) {
    console.log('Client disconnected', client.id);

    this.server.emit('user-left', {
      message: `User left the chat: ${client.id}`,
      clientId: client.id,
    });
  }

  @SubscribeMessage('openaiChat')
  async handleNewMessage(
    @MessageBody(new ZodValidationPipe(talkWithAgentSchema))
    data: z.infer<typeof talkWithAgentSchema>,
  ) {
    const response = await this.openAiService.talkToAgent(data);
    this.server.emit('openaiChat', response);
  }
}
