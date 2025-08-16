/* eslint-disable @typescript-eslint/unbound-method */
// utils.spec.ts
import { Utils } from './utils';
import { FileHelpers } from './file.helpers';
import { DocContent } from 'src/database/typeorm/entities';

jest.mock('./file.helpers', () => ({
  FileHelpers: {
    getFilePath: jest.fn(),
    mountJSONLData: jest.fn(),
    createFile: jest.fn(),
  },
}));

describe('Utils', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('mountFineTuneData', () => {
    it('deve montar corretamente os dados de fine-tune', () => {
      const content: DocContent[] = [
        { id: 1, content: 'Conteúdo de teste' } as DocContent,
      ];
      const docName = 'API Docs';

      const result = Utils.mountFineTuneData(content, docName);

      expect(result).toHaveLength(1);
      expect(result[0].messages).toEqual([
        {
          role: 'system',
          content: 'Você é um especialista em uma documentação de API Docs.',
        },
        {
          role: 'user',
          content: 'Faça um resumo do conteudo.',
        },
        {
          role: 'assistant',
          content: 'Conteúdo de teste',
        },
      ]);
    });

    it('deve retornar array vazio quando não houver conteúdo', () => {
      const result = Utils.mountFineTuneData([], 'API Docs');
      expect(result).toEqual([]);
    });
  });

  describe('createFineTuneFile', () => {
    it('deve chamar FileHelpers corretamente e retornar o filePath', () => {
      const mockPath = '/fake/path/15_1.jsonl';
      const docId = 1;
      const contentData = [{ foo: 'bar' }];

      (FileHelpers.getFilePath as jest.Mock).mockReturnValue(mockPath);
      (FileHelpers.mountJSONLData as jest.Mock).mockReturnValue('jsonl-data');

      const result = Utils.createFineTuneFile(docId, contentData);

      expect(FileHelpers.getFilePath).toHaveBeenCalledWith(
        expect.stringMatching(/^\d+_1\.jsonl$/),
      );
      expect(FileHelpers.mountJSONLData).toHaveBeenCalledWith(contentData);
      expect(FileHelpers.createFile).toHaveBeenCalledWith(
        mockPath,
        'jsonl-data',
      );
      expect(result).toBe(mockPath);
    });
  });
});
