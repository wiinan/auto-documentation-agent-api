import { WebhookResponseDto } from '../openai.dto';

export abstract class IOpenAiWebHookService {
  abstract updateModelAction(data: WebhookResponseDto): Promise<boolean>;
}
