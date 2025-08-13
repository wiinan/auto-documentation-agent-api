import {
  ZOD_NUMBER_REQUIRED,
  ZOD_STRING_REQUIRED,
} from 'src/helpers/zod.helpers';
import { z } from 'zod';

export const talkWithAgentSchema = z
  .object({
    docId: ZOD_NUMBER_REQUIRED,
    text: ZOD_STRING_REQUIRED,
  })
  .strip();
