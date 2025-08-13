import { InjectRepository } from '@nestjs/typeorm';
import { IOpenAiService } from '../interfaces/openai.interface';
import { DocContent } from 'src/database/entities';
import { Repository } from 'typeorm';
import { OpenAiAgentService } from 'src/gateways/openai';
import z from 'zod';
import { talkWithAgentSchema } from '../openai.schema';
import { Injectable } from '@nestjs/common';
import { map } from 'lodash';
import { InjectModel } from '@nestjs/mongoose';
import { Message } from 'src/database/mongoose/schemas/message.schema';
import { Model } from 'mongoose';

@Injectable()
export class OpenAiService implements IOpenAiService {
  constructor(
    @InjectRepository(DocContent)
    private readonly docContentModel: Repository<DocContent>,
    @InjectModel(Message.name)
    private readonly MessageModel: Model<Message>,
    private readonly openAiAgentService: OpenAiAgentService,
  ) {}

  async talkToAgent({
    docId,
    text,
  }: z.infer<typeof talkWithAgentSchema>): Promise<string> {
    const contents = await this.docContentModel.find({
      where: { docId, isDeleted: false },
      select: ['content'],
      take: 1,
    });

    if (!contents?.length) {
      return '';
    }

    await this.MessageModel.create({
      message: text,
      status: 'SEND',
      type: 'USER',
    });

    const documentationItems = map(contents, 'content').join(' ');

    const response = await this.openAiAgentService.talk(
      `
            Sendo um especialista em uma documentação de uma empresa,
            Com base nessa documentação abaixo:
            ${documentationItems}.
            responda a Pergunta: ${text}
            Caso a resposta para a pergunta não esteja na documentação diga que não sabe!
        `,
    );

    await this.MessageModel.create({
      message: response.output_text,
      status: 'SEND',
      type: 'AGENT',
    });

    return response.output_text;
  }

  async getMessages(): Promise<Message[]> {
    return this.MessageModel.find().sort({ createdAt: 1 }).exec();
  }
}
