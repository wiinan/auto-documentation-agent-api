import { ZOD_STRING_REQUIRED } from 'src/helpers/zod.helpers';
import { z } from 'zod';

export const saveDocumentationSchema = z
  .object({
    url: ZOD_STRING_REQUIRED,
  })
  .strip();
