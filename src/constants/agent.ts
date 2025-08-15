export enum DOC_STATUS {
  PROCESSING = 'PROCESSING',
  OPEN = 'OPEN',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
}

export enum TANSACTION_QUEUE {
  TRAINING = 'TRAINING',
}

export enum CHAT_ROLES {
  SYSTEM = 'SYSTEM',
  USER = 'USER',
  ASSISTANT = 'ASSISTANT',
  AGENT = 'AGENT',
}

export enum CHAT_STATUS {
  SEND = 'SEND',
}

export enum WEBHOOK_EVENT_STATUS {
  'fine_tuning.job.succeeded' = DOC_STATUS.COMPLETED,
  'fine_tuning.job.failed' = DOC_STATUS.FAILED,
  'fine_tuning.job.cancelled' = DOC_STATUS.CANCELLED,
}
