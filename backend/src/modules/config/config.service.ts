import { HttpService } from '@nestjs/axios';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { firstValueFrom } from 'rxjs';
import { LoggingService } from '../logging/logging.service';
import { AuthType, WhatsappConfig } from './schemas/whatsapp-config.schema';

@Injectable()
export class ConfigServiceApp {
  constructor(
    @InjectModel(WhatsappConfig.name)
    private readonly configModel: Model<WhatsappConfig>,
    private readonly httpService: HttpService,
    private readonly loggingService: LoggingService,
  ) {}

  create(payload: Partial<WhatsappConfig>) {
    return this.configModel.create(payload);
  }

  list() {
    return this.configModel.find().sort({ createdAt: -1 }).lean();
  }

  findActiveByPhoneId(phoneNumberId: string) {
    return this.configModel.findOne({
      phone_number_id: phoneNumberId,
      is_active: true,
    });
  }

  findActiveByDisplayPhone(displayPhoneNumber: string) {
    return this.configModel.findOne({
      display_phone_number: displayPhoneNumber,
      is_active: true,
    });
  }

  async update(id: string, payload: Partial<WhatsappConfig>) {
    const updated = await this.configModel.findByIdAndUpdate(id, payload, {
      new: true,
    });
    if (!updated) throw new NotFoundException('Config not found');
    return updated;
  }

  async remove(id: string) {
    const deleted = await this.configModel.findByIdAndDelete(id);
    if (!deleted) throw new NotFoundException('Config not found');
    return { deleted: true };
  }

  async testWebhook(id: string) {
    const config = await this.configModel.findById(id).lean();
    if (!config) throw new NotFoundException('Config not found');

    const nowTs = Math.floor(Date.now() / 1000).toString();
    const waMessageId = `wamid.SIM-${Date.now()}`;
    const payload = {
      object: 'whatsapp_business_account',
      entry: [
        {
          id: `WABA_SIM_${config.phone_number_id}`,
          changes: [
            {
              field: 'messages',
              value: {
                messaging_product: 'whatsapp',
                metadata: {
                  display_phone_number: config.display_phone_number,
                  phone_number_id: config.phone_number_id,
                },
                contacts: [
                  {
                    profile: { name: 'Usuario Simulado' },
                    wa_id: '573001112233',
                  },
                ],
                messages: [
                  {
                    from: '573001112233',
                    id: waMessageId,
                    timestamp: nowTs,
                    type: 'text',
                    text: {
                      body: 'Mensaje de prueba del simulador WAPI Router',
                    },
                  },
                ],
              },
            },
          ],
        },
      ],
    };

    const headers: Record<string, string> = {
      'content-type': 'application/json',
      'x-webhook-simulation': 'wapi-router',
    };
    if (config.auth_type === AuthType.BEARER && config.auth_token) {
      headers.Authorization = `Bearer ${config.auth_token}`;
    }
    if (config.auth_type === AuthType.API_KEY && config.auth_token) {
      headers['x-api-key'] = config.auth_token;
    }

    const started = Date.now();
    try {
      const response = await firstValueFrom(
        this.httpService.post(config.webhook_url, payload, { headers, timeout: 10000 }),
      );
      await this.loggingService.createRoutingLog({
        event_type: 'routing_test',
        phone_number_id: config.phone_number_id,
        target_webhook: config.webhook_url,
        app_name: config.app_name,
        status: 'success',
        attempts: 1,
        http_status: response.status,
        request_body: payload,
        response_body: (response.data as Record<string, unknown>) || {},
        latency_ms: Date.now() - started,
      });
      return {
        success: true,
        http_status: response.status,
        latency_ms: Date.now() - started,
        response_body: response.data,
      };
    } catch (error) {
      const err = error as Error & { response?: { status?: number; data?: unknown } };
      await this.loggingService.createRoutingLog({
        event_type: 'routing_test',
        phone_number_id: config.phone_number_id,
        target_webhook: config.webhook_url,
        app_name: config.app_name,
        status: 'failed',
        attempts: 1,
        http_status: err.response?.status,
        request_body: payload,
        response_body: (err.response?.data as Record<string, unknown>) || {},
        error_message: err.message,
        latency_ms: Date.now() - started,
      });
      return {
        success: false,
        http_status: err.response?.status ?? 0,
        latency_ms: Date.now() - started,
        error_message: err.message,
        response_body: err.response?.data ?? null,
      };
    }
  }
}
