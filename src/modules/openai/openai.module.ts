import { Module } from '@nestjs/common';
import { IOpenAiService } from './interfaces/openai.interface';
import { OpenAiService } from './services/openai.service';
import { Doc, DocContent } from 'src/database/typeorm/entities';
import { OpenAiChatGateway } from 'src/gateways/openai-chat';
import { OpenAiController } from './controllers/openai.controller';
import { MongooseModule } from '@nestjs/mongoose';
import forFeatureDb from 'src/database/mongoose/for-feature.db';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CronJobAgentAi } from 'src/crons/agentia.cron';
import { OpenAiWebhookController } from './controllers/openai-webhook.controller';
import { IOpenAiWebHookService } from './interfaces/openai-webhook.interface';
import { OpenAiWebHookService } from './services/openai-webhook.service';
import { customOpenAiProvider } from './openai.provider';

@Module({
  imports: [
    TypeOrmModule.forFeature([Doc, DocContent]),
    MongooseModule.forFeature(forFeatureDb),
  ],
  providers: [
    customOpenAiProvider,
    OpenAiChatGateway,
    CronJobAgentAi,
    {
      provide: IOpenAiService,
      useClass: OpenAiService,
    },
    {
      provide: IOpenAiWebHookService,
      useClass: OpenAiWebHookService,
    },
  ],
  controllers: [OpenAiController, OpenAiWebhookController],
})
export class OpenAiModule {}
