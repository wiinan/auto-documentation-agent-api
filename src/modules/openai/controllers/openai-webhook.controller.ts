import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { IOpenAiWebHookService } from '../interfaces/openai-webhook.interface';
import { ValidateWebhook } from 'src/middleware/validate-webhook';
import { WebhookResponseDto } from '../openai.dto';

@Controller('openai/webhook')
export class OpenAiWebhookController {
  constructor(private readonly openAiWebhookService: IOpenAiWebHookService) {}

  @Post()
  @UseGuards(ValidateWebhook)
  async getMessagesAction(@Body() data: WebhookResponseDto): Promise<boolean> {
    return this.openAiWebhookService.updateModelAction(data);
  }
}
