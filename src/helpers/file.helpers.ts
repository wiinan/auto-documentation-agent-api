import { writeFileSync } from 'fs';
import { join } from 'path';

export class FileHelpers {
  static mountJSONLData(data: any[]) {
    return data.map((obj) => JSON.stringify(obj)).join('\n');
  }

  static createFile(
    filePath: string,
    data: string | NodeJS.ArrayBufferView<ArrayBufferLike>,
  ): void {
    writeFileSync(filePath, data);
  }

  static getFilePath(fileName: string): string {
    return join(process.cwd(), 'src', 'temp', fileName);
  }
}
