import { z } from 'zod';

export const ZOD_STRING_NULLABLE = z.string().optional();
export const ZOD_STRING_REQUIRED = z.string();
export const ZOD_NUMBER_NULLABLE = z.number().positive().optional();
export const ZOD_NUMBER_REQUIRED = z.number().positive();
export const ZOD_BOOLEAN_DEFAULT_FALSE = z.boolean().default(false);
export const ZOD_DATE_REQUIRED = z.string().date();
export const ZOD_STRING_PARSE_TO_NUMBER = z.coerce.number().optional();
export const ZOD_NUMBER_PARAMS = z.string().transform(Number);
