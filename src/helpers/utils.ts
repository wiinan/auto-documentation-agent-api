import { DocContent } from 'src/database/typeorm/entities';
import { FileHelpers } from './file.helpers';

export class Utils {
  static mountFineTuneData(content: DocContent[], docName: string) {
    return content.map((content) => ({
      messages: [
        {
          role: 'system',
          content: `Você é um especialista em uma documentação de ${docName}.`,
        },
        {
          role: 'user',
          content: 'Faça um resumo do conteudo.',
        },
        {
          role: 'assistant',
          content: content.content,
        },
      ],
    }));
  }

  static createFineTuneFile(docId: number, contentData: any[]): string {
    const fileName = `${new Date().getDate()}_${docId}.jsonl`;
    const filePath = FileHelpers.getFilePath(fileName);
    const jsonlContent = FileHelpers.mountJSONLData(contentData);

    FileHelpers.createFile(filePath, jsonlContent);

    return filePath;
  }
}
