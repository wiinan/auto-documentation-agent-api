import { z } from 'zod';
import { talkWithAgentSchema } from '../openai.schema';
import { Message } from 'src/database/mongoose/schemas/message.schema';

export abstract class IOpenAiService {
  abstract talkToAgent(
    data: z.infer<typeof talkWithAgentSchema>,
  ): Promise<string>;
  abstract getMessages(): Promise<Message[]>;
  abstract trainingAgentAction(): Promise<void>;
}
