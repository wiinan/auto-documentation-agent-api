import OpenAI from 'openai';
import { OpenAiAgentService } from 'src/gateways/openai';

export const customOpenAiProvider = {
  provide: OpenAiAgentService,
  useFactory: () => {
    const openAi = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      baseURL: process.env.OPENAI_URL,
    });

    return new OpenAiAgentService(openAi);
  },
};
