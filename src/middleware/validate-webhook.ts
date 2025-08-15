import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

@Injectable()
export class ValidateWebhook implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request: Request = context.switchToHttp().getRequest();
    const webHookId = request.headers['webhook-id'] as string;

    return webHookId === process.env.OPENAI_WEBHOOK_SECRET;
  }
}
