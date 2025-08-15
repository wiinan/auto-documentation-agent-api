import { InjectRepository } from '@nestjs/typeorm';
import { IOpenAiService } from '../interfaces/openai.interface';
import { Doc, DocContent } from 'src/database/typeorm/entities';
import { Repository } from 'typeorm';
import { OpenAiAgentService } from 'src/gateways/openai';
import z from 'zod';
import { talkWithAgentSchema } from '../openai.schema';
import { Injectable } from '@nestjs/common';
import { map } from 'lodash';
import { InjectModel } from '@nestjs/mongoose';
import { Message } from 'src/database/mongoose/schemas/message.schema';
import { Model } from 'mongoose';
import { CHAT_ROLES, CHAT_STATUS, DOC_STATUS } from 'src/constants/agent';
import { Utils } from 'src/helpers/utils';

@Injectable()
export class OpenAiService implements IOpenAiService {
  constructor(
    @InjectRepository(Doc)
    private readonly docModel: Repository<Doc>,
    @InjectRepository(DocContent)
    private readonly docContentModel: Repository<DocContent>,
    @InjectModel(Message.name)
    private readonly MessageModel: Model<Message>,
    private readonly openAiAgentService: OpenAiAgentService,
  ) {}

  async trainingAgentAction(): Promise<void> {
    const docs = await this.docModel.find({
      where: {
        status: DOC_STATUS.OPEN,
        isDeleted: false,
        docContent: { isDeleted: false },
      },
      relations: ['docContent'],
      select: ['id', 'name', 'docContent'],
    });

    for (const { docContent, id, name } of docs) {
      const contentData = Utils.mountFineTuneData(docContent, name);
      const filePath = Utils.createFineTuneFile(id, contentData);
      const agentData = await this.openAiAgentService.fineTuneAction(filePath);

      await this.docModel.update(id, {
        fineTuneJobId: agentData.id,
        status: DOC_STATUS.PROCESSING,
      });
    }
  }

  async talkToAgent({
    docId,
    text,
  }: z.infer<typeof talkWithAgentSchema>): Promise<string> {
    const doc = await this.docModel.findOne({
      where: {
        id: docId,
        isDeleted: false,
        docContent: { isDeleted: false },
      },
      relations: ['docContent'],
      select: ['id', 'modelName', 'docContent'],
    });

    if (!doc) {
      return '';
    }

    await this.MessageModel.create({
      message: text,
      status: CHAT_STATUS.SEND,
      type: CHAT_ROLES.USER,
    });

    const documentationItems =
      doc.docContent[0].content || map(doc.docContent, 'content').join(' ');

    const response = await this.openAiAgentService.talk(
      `
            Sendo um especialista em uma documentação de uma empresa,
            Com base nessa documentação abaixo:
            ${documentationItems}.
            responda a Pergunta: ${text}
            Caso a resposta para a pergunta não esteja na documentação diga que não sabe!
        `,
      doc.modelName,
    );

    await this.MessageModel.create({
      message: response.choices[0].text || '',
      status: CHAT_STATUS.SEND,
      type: CHAT_ROLES.AGENT,
    });

    return response.choices[0].text || '';
  }

  async getMessages(): Promise<Message[]> {
    return this.MessageModel.find().sort({ createdAt: 1 }).exec();
  }
}
