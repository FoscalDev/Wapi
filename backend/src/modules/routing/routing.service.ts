import { HttpService } from '@nestjs/axios';
import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { ConfigServiceApp } from '../config/config.service';
import { AuthType } from '../config/schemas/whatsapp-config.schema';
import { LoggingService } from '../logging/logging.service';
import { RetryService } from '../retry/retry.service';

@Injectable()
export class RoutingService {
  constructor(
    private readonly httpService: HttpService,
    private readonly configServiceApp: ConfigServiceApp,
    private readonly loggingService: LoggingService,
    @Inject(forwardRef(() => RetryService))
    private readonly retryService: RetryService,
    private readonly config: ConfigService,
  ) {}

  async routePayload(
    payload: Record<string, unknown>,
    attempt = 1,
    allowEnqueueRetry = true,
  ) {
    const value = (((payload.entry as any[])?.[0]?.changes as any[])?.[0]?.value ?? {}) as Record<string, any>;
    const phoneNumberId = value.metadata?.phone_number_id as string;
    const displayPhoneNumber = value.metadata?.display_phone_number as string;

    const appConfig =
      (phoneNumberId && (await this.configServiceApp.findActiveByPhoneId(phoneNumberId))) ||
      (displayPhoneNumber &&
        (await this.configServiceApp.findActiveByDisplayPhone(displayPhoneNumber)));

    if (!appConfig) {
      await this.loggingService.createRoutingLog({
        phone_number_id: phoneNumberId,
        target_webhook: 'not_found',
        app_name: 'unknown',
        status: 'failed',
        attempts: attempt,
        error_message: 'No active routing config',
      });
      return;
    }

    const started = Date.now();
    const headers: Record<string, string> = {};
    if (appConfig.auth_type === AuthType.BEARER && appConfig.auth_token) {
      headers.Authorization = `Bearer ${appConfig.auth_token}`;
    }
    if (appConfig.auth_type === AuthType.API_KEY && appConfig.auth_token) {
      headers['x-api-key'] = appConfig.auth_token;
    }

    try {
      const timeout = this.config.get<number>('REQUEST_TIMEOUT_MS', 10000);
      const response = await firstValueFrom(
        this.httpService.post(appConfig.webhook_url, payload, { headers, timeout }),
      );
      await this.loggingService.createRoutingLog({
        phone_number_id: phoneNumberId,
        target_webhook: appConfig.webhook_url,
        app_name: appConfig.app_name,
        status: 'success',
        attempts: attempt,
        http_status: response.status,
        request_body: payload,
        response_body: response.data as Record<string, unknown>,
        latency_ms: Date.now() - started,
      });
      return true;
    } catch (error) {
      const err = error as Error & { response?: { status?: number; data?: unknown } };
      await this.loggingService.createRoutingLog({
        phone_number_id: phoneNumberId,
        target_webhook: appConfig.webhook_url,
        app_name: appConfig.app_name,
        status: 'failed',
        attempts: attempt,
        http_status: err.response?.status,
        request_body: payload,
        response_body: (err.response?.data as Record<string, unknown>) || {},
        error_message: err.message,
        latency_ms: Date.now() - started,
      });
      if (allowEnqueueRetry && attempt < 5) {
        await this.retryService.enqueueRetry(phoneNumberId, payload, attempt + 1, err.message);
      }
      return false;
    }
  }
}
