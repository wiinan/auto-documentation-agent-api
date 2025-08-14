import { BadRequestException, Injectable } from '@nestjs/common';
import OpenAI from 'openai';

@Injectable()
export class OpenAiAgentService {
  constructor(private readonly openAiAgent: OpenAI) {}

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
