import {
  FirecrawlDocumentMetadata,
  ScrapeResponse,
} from '@mendable/firecrawl-js';
import { ApiProperty } from '@nestjs/swagger';

export class SaveDocumentationRequestDto {
  @ApiProperty({
    example: 'https://docs.nestjs.com/',
    required: true,
  })
  url: string;
}

export type ScrapDataDto = {
  url?: string;
  markdown: string;
  html?: string;
  links?: string[];
  sourceURL: string;
  metadata?: FirecrawlDocumentMetadata;
};

export type ScrapCrawResponseDto = {
  data?: Array<ScrapDataDto>;
} & ScrapeResponse;

export type vectorStoreDocumentDto = {
  content: string;
  embedding: number[];
};
