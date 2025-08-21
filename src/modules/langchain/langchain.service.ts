import { Injectable } from '@nestjs/common';

import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { Document } from '@langchain/core/documents';

@Injectable()
export class LangChainService {
  constructor(
    private readonly characterTextSplitter: RecursiveCharacterTextSplitter,
  ) {}

  async textSpliter(pageContent: string): Promise<string[]> {
    const docOutput = await this.characterTextSplitter.splitDocuments([
      new Document({ pageContent }),
    ]);

    return docOutput.map((doc) => doc.pageContent);
  }
}
