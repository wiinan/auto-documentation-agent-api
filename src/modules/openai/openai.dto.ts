import { ApiProperty } from '@nestjs/swagger';

export class TalkAgentRequestDto {
  @ApiProperty({
    description: 'The text to send to the agent.',
    example: 'Como funciona a API do OpenAI?',
  })
  text: string;
  @ApiProperty({
    description: 'The ID of the document to reference.',
    example: 6,
  })
  docId: number;
}

export type WebhookResponseDto = {
  object: string;
  id: string;
  type: string;
  created_at: number;
  data: { id: string; fine_tuned_model: string };
};
