import { BadRequestException, Injectable } from '@nestjs/common';
import OpenAI from 'openai';

@Injectable()
export class OpenAiAgentService {
  private openAiAgent: OpenAI;

  constructor() {
    this.openAiAgent = new OpenAI({
      apiKey: process.env.OPENAI_KEY,
      baseURL: process.env.OPENAI_URL,
    });
  }

  async talk(input: string) {
    try {
      const response = await this.openAiAgent.responses.create({
        model: process.env.OPENAI_MODEL,
        input,
      });

      return response;
    } catch (error) {
      console.log(error);
      throw new BadRequestException('OpenAiAgentService.talk ERROR');
    }
  }
}
