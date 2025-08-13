import { Body, Controller, Post } from '@nestjs/common';
import { ZodValidationPipe } from 'src/middlewares/validator.pipe';
import { saveDocumentationSchema } from '../web-scraping.schema';
import { IWebScrapingService } from '../interfaces/web-scraping.interface';
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SaveDocumentationRequestDto } from '../web-scraping.dto';

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
  saveDocumentationUrl(
    @Body(new ZodValidationPipe(saveDocumentationSchema)) data: { url: string },
  ): Promise<boolean> {
    return this.webScrapingService.saveDocAction(data.url);
  }
}
