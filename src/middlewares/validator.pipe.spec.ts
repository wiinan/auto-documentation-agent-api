// zod-validation.pipe.spec.ts
import { BadRequestException } from '@nestjs/common';
import { z } from 'zod';
import { ZodValidationPipe } from './validator.pipe';

describe('ZodValidationPipe', () => {
  let pipe: ZodValidationPipe;

  beforeEach(() => {
    const schema = z.object({
      name: z.string(),
      age: z.number().min(18),
    });
    pipe = new ZodValidationPipe(schema);
  });

  it('deve retornar os dados quando válidos', () => {
    const data = { name: 'Alice', age: 25 };

    const result = pipe.transform(data);

    expect(result).toEqual(data);
  });

  it('deve lançar BadRequestException quando os dados forem inválidos', () => {
    const data = { name: 'Alice', age: 15 }; // menor de idade inválido

    expect(() => pipe.transform(data)).toThrow(BadRequestException);
  });

  it('deve chamar console.warn em caso de erro de validação', () => {
    const spy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    const data = { name: 'Alice' }; // falta a idade

    try {
      pipe.transform(data);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      /* empty */
    }

    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });
});
