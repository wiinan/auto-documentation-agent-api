// file-helpers.spec.ts
import { writeFileSync } from 'fs';
import { join } from 'path';
import { FileHelpers } from './file.helpers';

jest.mock('fs', () => ({
  writeFileSync: jest.fn(),
}));

describe('FileHelpers', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('mountJSONLData', () => {
    it('deve converter array de objetos para string JSONL', () => {
      const data = [
        { id: 1, name: 'Pikachu', type: 'Eletric' },
        { id: 2, name: 'Charizard', type: 'Fire' },
      ];
      const result = FileHelpers.mountJSONLData(data);

      expect(result).toBe(
        '{"id":1,"name":"Pikachu","type":"Eletric"}\n{"id":2,"name":"Charizard","type":"Fire"}',
      );
    });

    it('deve retornar string vazia para array vazio', () => {
      const result = FileHelpers.mountJSONLData([]);
      expect(result).toBe('');
    });
  });

  describe('createFile', () => {
    it('deve chamar writeFileSync com os parâmetros corretos', () => {
      const filePath = 'teste.jsonl';
      const content = 'conteúdo';

      FileHelpers.createFile(filePath, content);

      expect(writeFileSync).toHaveBeenCalledTimes(1);
      expect(writeFileSync).toHaveBeenCalledWith(filePath, content);
    });
  });

  describe('getFilePath', () => {
    it('deve retornar caminho completo do arquivo', () => {
      const fileName = 'teste.jsonl';
      const expectedPath = join(process.cwd(), 'src', 'temp', fileName);

      const result = FileHelpers.getFilePath(fileName);

      expect(result).toBe(expectedPath);
    });
  });
});
