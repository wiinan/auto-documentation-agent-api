import { PipeTransform, BadRequestException } from '@nestjs/common';
import { ZodSchema } from 'zod';

export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: ZodSchema) {}

  transform(data: unknown) {
    try {
      const value = Object.assign({}, data);

      return this.schema.parse(value);
    } catch (error) {
      console.warn(error);
      throw new BadRequestException('Validation failed');
    }
  }
}
