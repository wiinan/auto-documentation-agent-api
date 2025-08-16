// validate-webhook.spec.ts
import { ExecutionContext } from '@nestjs/common';
import { ValidateWebhook } from './validate-webhook';

describe('ValidateWebhook', () => {
  let guard: ValidateWebhook;

  beforeEach(() => {
    guard = new ValidateWebhook();
    process.env.OPENAI_WEBHOOK_SECRET = 'super-secret';
  });

  const mockExecutionContext = (
    headers: Record<string, any>,
  ): ExecutionContext =>
    ({
      switchToHttp: () => ({
        getRequest: () => ({
          headers,
        }),
      }),
    }) as ExecutionContext;

  it('deve retornar true quando o webhook-id corresponder ao segredo', () => {
    const context = mockExecutionContext({ 'webhook-id': 'super-secret' });

    const result = guard.canActivate(context);

    expect(result).toBe(true);
  });

  it('deve retornar false quando o webhook-id não corresponder ao segredo', () => {
    const context = mockExecutionContext({ 'webhook-id': 'invalid-secret' });

    const result = guard.canActivate(context);

    expect(result).toBe(false);
  });

  it('deve retornar false quando não houver webhook-id no header', () => {
    const context = mockExecutionContext({});

    const result = guard.canActivate(context);

    expect(result).toBe(false);
  });
});
