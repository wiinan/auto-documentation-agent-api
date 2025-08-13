export abstract class IWebScrapingService {
  abstract saveDocAction(url: string): Promise<boolean>;
}
