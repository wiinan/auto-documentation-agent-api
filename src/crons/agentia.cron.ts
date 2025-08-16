import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { IOpenAiService } from 'src/modules/openai/interfaces/openai.interface';

@Injectable()
export class CronJobAgentAi {
  private readonly logger = new Logger(CronJobAgentAi.name);
  constructor(private readonly openAiService: IOpenAiService) {}

  @Cron(CronExpression.EVERY_5_SECONDS)
  async handleCron() {
    this.logger.debug('CronJobAgentAi Cronjob Started');

    try {
      await this.openAiService.trainingAgentAction();

      this.logger.debug('CronJobAgentAi Cronjob Finished with success');
    } catch (error) {
      this.logger.debug('CronJobAgentAi Cronjob Finished with error', error);
    }
  }
}
