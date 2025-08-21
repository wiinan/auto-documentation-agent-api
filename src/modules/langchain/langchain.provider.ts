import { LangChainService } from 'src/modules/langchain/langchain.service';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';

export const customLangChainProvider = {
  provide: LangChainService,
  useFactory: () => {
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 50,
    });

    return new LangChainService(splitter);
  },
};
