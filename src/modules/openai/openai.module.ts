import { Module } from '@nestjs/common';
import { IOpenAiService } from './interfaces/openai.interface';
import { OpenAiService } from './services/openai.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Doc, DocContent } from 'src/database/entities';
import { OpenAiAgentService } from 'src/gateways/openai';
import { OpenAiChatGateway } from 'src/gateways/openai-chat';
import { OpenAiController } from './controllers/openai.controller';
import { MongooseModule } from '@nestjs/mongoose';
import forFeatureDb from 'src/database/mongoose/for-feature.db';
import OpenAI from 'openai';

@Module({
  imports: [
    TypeOrmModule.forFeature([Doc, DocContent]),
    MongooseModule.forFeature(forFeatureDb),
  ],
  providers: [
    OpenAiChatGateway,
    {
      provide: IOpenAiService,
      useClass: OpenAiService,
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
  controllers: [OpenAiController],
})
export class OpenAiModule {}
