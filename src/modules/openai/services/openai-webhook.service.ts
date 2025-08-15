import { InjectRepository } from '@nestjs/typeorm';
import { IOpenAiWebHookService } from '../interfaces/openai-webhook.interface';
import { WebhookResponseDto } from '../openai.dto';
import { Doc } from 'src/database/typeorm/entities';
import { Repository } from 'typeorm';
import { WEBHOOK_EVENT_STATUS } from 'src/constants/agent';
import { BadRequestException } from '@nestjs/common';

export class OpenAiWebHookService implements IOpenAiWebHookService {
  constructor(
    @InjectRepository(Doc)
    private readonly docModel: Repository<Doc>,
  ) {}

  async updateModelAction({
    data,
    id,
    type,
  }: WebhookResponseDto): Promise<boolean> {
    const doc = await this.docModel.findOne({
      where: { fineTuneJobId: id },
      select: ['id'],
    });

    if (!doc) {
      throw new BadRequestException('FINE_TUNE_JOB_NOT_FOUND');
    }

    const status = WEBHOOK_EVENT_STATUS[type] as WEBHOOK_EVENT_STATUS;

    await this.docModel.update(doc.id, {
      modelName: data.fine_tuned_model,
      status,
    });

    return true;
  }
}
