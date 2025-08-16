import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { IOpenAiWebHookService } from '../interfaces/openai-webhook.interface';
import { WebhookResponseDto } from '../openai.dto';
import { ValidateWebhook } from 'src/middlewares/validate-webhook';

@Controller('openai/webhook')
export class OpenAiWebhookController {
  constructor(private readonly openAiWebhookService: IOpenAiWebHookService) {}

  @Post()
  @UseGuards(ValidateWebhook)
  async getMessagesAction(@Body() data: WebhookResponseDto): Promise<boolean> {
    return this.openAiWebhookService.updateModelAction(data);
  }
}
