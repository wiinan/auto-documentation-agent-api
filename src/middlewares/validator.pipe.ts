import {
  PipeTransform,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';
import { ZodSchema } from 'zod';

export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: ZodSchema) {}

  transform(data: unknown, metadata: ArgumentMetadata) {
    try {
      const value = Object.assign({}, data);

      return this.schema.parse(value);
    } catch (error) {
      console.warn(error);
      throw new BadRequestException('Validation failed');
    }
  }
}
