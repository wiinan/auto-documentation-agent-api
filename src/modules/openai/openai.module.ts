import { Module } from '@nestjs/common';
import { IOpenAiService } from './interfaces/openai.interface';
import { OpenAiService } from './services/openai.service';
import { Doc, DocContent } from 'src/database/typeorm/entities';
import { OpenAiAgentService } from 'src/gateways/openai';
import { OpenAiChatGateway } from 'src/gateways/openai-chat';
import { OpenAiController } from './controllers/openai.controller';
import { MongooseModule } from '@nestjs/mongoose';
import forFeatureDb from 'src/database/mongoose/for-feature.db';
import OpenAI from 'openai';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CronJobAgentAi } from 'src/crons/agentia.cron';
import { OpenAiWebhookController } from './controllers/openai-webhook.controller';
import { IOpenAiWebHookService } from './interfaces/openai-webhook.interface';
import { OpenAiWebHookService } from './services/openai-webhook.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Doc, DocContent]),
    MongooseModule.forFeature(forFeatureDb),
  ],
  providers: [
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
    {
      provide: OpenAiAgentService,
      useFactory: () => {
        const openAi = new OpenAI({
          apiKey: process.env.OPENAI_KEY,
          baseURL: process.env.OPENAI_URL,
        });

        return new OpenAiAgentService(openAi);
      },
    },
  ],
  controllers: [OpenAiController, OpenAiWebhookController],
})
export class OpenAiModule {}
