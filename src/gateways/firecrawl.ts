import FirecrawlApp from '@mendable/firecrawl-js';
import { BadRequestException, Injectable } from '@nestjs/common';

@Injectable()
export class FirecrawlService {
  private firecrawl: FirecrawlApp;
  constructor() {
    this.firecrawl = new FirecrawlApp({
      apiKey: process.env.FIRECRAWL_KEY,
    });
  }

  async getDocContent<T>(url: string): Promise<T> {
    try {
      if (!url) {
        throw new BadRequestException('INVALID_URL_PARAMS');
      }

      const response = (await this.firecrawl.crawlUrl(url)) as T;
      return response;
    } catch (error) {
      console.log(error);
      throw new BadRequestException('getDocContent ERROR');
    }
  }
}
