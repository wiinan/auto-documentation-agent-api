import { Controller, Get } from '@nestjs/common';
import { IOpenAiService } from '../interfaces/openai.interface';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Message } from 'src/database/mongoose/schemas/message.schema';

@Controller('openai')
export class OpenAiController {
  constructor(private readonly openAiService: IOpenAiService) {}

  @Get()
  @ApiOperation({
    summary: 'Mensagens enviadas e recebidas',
    description: 'Retorna as mensagens enviadas e respondidas do agente OpenAI',
  })
  @ApiResponse({
    status: 200,
    description: 'Retorna as mensagens enviadas e respondidas do agente OpenAI',
    type: Message,
    isArray: true,
  })
  async getMessagesAction(): Promise<Message[]> {
    return this.openAiService.getMessages();
  }
}
