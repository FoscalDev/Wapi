import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { WebhookSettings } from './schemas/webhook-settings.schema';

@Injectable()
export class SettingsService {
  constructor(
    @InjectModel(WebhookSettings.name)
    private readonly settingsModel: Model<WebhookSettings>,
    private readonly config: ConfigService,
  ) {}

  async getWebhookSettings() {
    const stored = await this.settingsModel.findOne({ provider: 'meta' }).lean();
    if (stored) {
      return stored;
    }
    return {
      provider: 'meta',
      verify_token: this.config.get<string>('META_VERIFY_TOKEN', ''),
      app_secret: this.config.get<string>('META_APP_SECRET', ''),
    };
  }

  async upsertWebhookSettings(verifyToken: string, appSecret: string) {
    return this.settingsModel.findOneAndUpdate(
      { provider: 'meta' },
      {
        provider: 'meta',
        verify_token: verifyToken,
        app_secret: appSecret,
      },
      { upsert: true, new: true },
    );
  }

  async getEffectiveVerifyToken() {
    const data = await this.getWebhookSettings();
    return data.verify_token || this.config.get<string>('META_VERIFY_TOKEN', '');
  }

  async getEffectiveAppSecret() {
    const data = await this.getWebhookSettings();
    return data.app_secret || this.config.get<string>('META_APP_SECRET', '');
  }
}
