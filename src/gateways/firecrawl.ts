import FirecrawlApp from '@mendable/firecrawl-js';
import { BadRequestException, Injectable } from '@nestjs/common';

@Injectable()
export class FirecrawlService {
  constructor(private readonly firecrawl: FirecrawlApp) {}

  async getDocContent<T>(url: string): Promise<T> {
    if (!url) {
      throw new BadRequestException('INVALID_URL_PARAMS');
    }

    const response = (await this.firecrawl.crawlUrl(url)) as T;
    return response;
  }
}
