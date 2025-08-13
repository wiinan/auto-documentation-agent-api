import { Body, Controller, Get, Post } from '@nestjs/common';
import { ZodValidationPipe } from 'src/middlewares/validator.pipe';
import { saveDocumentationSchema } from '../web-scraping.schema';
import { IWebScrapingService } from '../interfaces/web-scraping.interface';
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SaveDocumentationRequestDto } from '../web-scraping.dto';
import { Doc } from 'src/database/entities';

@Controller('doc')
export class WebScrapingController {
  constructor(private readonly webScrapingService: IWebScrapingService) {}

  @Post()
  @ApiOperation({
    summary: 'Inserir URL de documentação',
    description:
      'Salava as informações do link e dos sublinks da URL da documentação para treinar o agente do OpenAi.',
  })
  @ApiBody({
    description: 'URL da documentação',
    type: SaveDocumentationRequestDto,
    examples: {
      example1: {
        value: { url: 'https://docs.nestjs.com/' },
        summary: 'Exemplo de URL',
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Retorno de sucesso',
    type: Boolean,
  })
  @ApiResponse({
    status: 404,
    description: 'Retorno de documentação não encontrada',
    example: 'NO_DOCUMENT_FOUND',
  })
  saveDocumentationUrl(
    @Body(new ZodValidationPipe(saveDocumentationSchema)) data: { url: string },
  ): Promise<boolean> {
    return this.webScrapingService.saveDocAction(data.url);
  }

  @ApiOperation({
    summary: 'Listar URLs de documentação salvas',
    description: 'Listar todas as URLs das documentações salvas.',
  })
  @ApiResponse({
    status: 200,
    description: 'Retorno de sucesso',
    type: Doc,
    isArray: true,
  })
  @Get()
  listWebScrapingDocsAction() {
    return this.webScrapingService.listWebScrapingDocs();
  }
}
