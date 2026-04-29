import { Controller, Get, Headers, Post, Query, Req } from '@nestjs/common';
import { Request } from 'express';
import { LoggingService } from '../logging/logging.service';
import { RoutingService } from '../routing/routing.service';
import { WebhookService } from './webhook.service';

@Controller('webhook/meta')
export class WebhookController {
  constructor(
    private readonly webhookService: WebhookService,
    private readonly loggingService: LoggingService,
    private readonly routingService: RoutingService,
  ) {}

  @Get()
  verify(
    @Query('hub.mode') mode: string,
    @Query('hub.verify_token') token: string,
    @Query('hub.challenge') challenge: string,
  ) {
    return this.webhookService.verifyChallenge(mode, token, challenge);
  }

  @Post()
  async receive(
    @Req() req: Request & { body: Buffer | Record<string, unknown> },
    @Headers('x-hub-signature-256') signature?: string,
  ) {
    const raw = Buffer.isBuffer(req.body)
      ? req.body
      : Buffer.from(JSON.stringify(req.body ?? {}));
    await this.webhookService.validateSignature(raw, signature);

    const body = Buffer.isBuffer(req.body)
      ? (JSON.parse(req.body.toString('utf8')) as Record<string, any>)
      : ((req.body as Record<string, any>) ?? {});

    const value = body?.entry?.[0]?.changes?.[0]?.value ?? {};
    const message = value.messages?.[0] ?? {};
    await this.loggingService.createMessageLog({
      phone_number_id: value.metadata?.phone_number_id ?? '',
      display_phone_number: value.metadata?.display_phone_number ?? '',
      from: message.from ?? '',
      message_type: message.type ?? 'unknown',
      message_content: message.text?.body ?? '',
      raw_payload: body,
      received_at: new Date(),
    });

    await this.routingService.routePayload(body);
    return { received: true };
  }
}
