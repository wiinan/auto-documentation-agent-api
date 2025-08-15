import { Doc } from 'src/database/typeorm/entities';

export abstract class IWebScrapingService {
  abstract saveDocAction(url: string): Promise<boolean>;
  abstract listWebScrapingDocs(): Promise<Doc[]>;
}
