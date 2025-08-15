import { BadRequestException, Injectable } from '@nestjs/common';
import { createReadStream } from 'fs';
import OpenAI from 'openai';

@Injectable()
export class OpenAiAgentService {
  constructor(private readonly openAiAgent: OpenAI) {}

  async talk(prompt: string, model?: string) {
    try {
      const response = await this.openAiAgent.completions.create({
        model: model || process.env.OPENAI_MODEL || '',
        prompt,
        temperature: 0.2,
        top_p: 1,
        max_tokens: 4000,
      });

      return response;
    } catch (error) {
      console.log(error);
      throw new BadRequestException('OpenAiAgentService.talk ERROR');
    }
  }

  async fineTuneAction(filePath: string) {
    try {
      const file = await this.openAiAgent.files.create({
        file: createReadStream(filePath),
        purpose: 'fine-tune',
      });

      const agentData = await this.openAiAgent.fineTuning.jobs.create({
        training_file: file.id,
        model: process.env.OPENAI_MODEL || '',
      });

      return agentData;
    } catch (error) {
      console.log(error);
      throw new BadRequestException('OpenAiAgentService.talk ERROR');
    }
  }
}
