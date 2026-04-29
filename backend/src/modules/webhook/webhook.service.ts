import { createHmac, timingSafeEqual } from 'crypto';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SettingsService } from '../settings/settings.service';

@Injectable()
export class WebhookService {
  constructor(
    private readonly config: ConfigService,
    private readonly settingsService: SettingsService,
  ) {}

  async verifyChallenge(mode: string, token: string, challenge: string) {
    const verifyToken = await this.settingsService.getEffectiveVerifyToken();
    if (mode === 'subscribe' && token === verifyToken) {
      return challenge;
    }
    throw new UnauthorizedException('Invalid verify token');
  }

  async validateSignature(rawBody: Buffer, signatureHeader?: string) {
    const appSecret =
      (await this.settingsService.getEffectiveAppSecret()) ||
      this.config.get<string>('META_APP_SECRET');
    if (!appSecret || !signatureHeader) {
      throw new UnauthorizedException('Missing signature');
    }
    const expected = `sha256=${createHmac('sha256', appSecret).update(rawBody).digest('hex')}`;
    const isValid = timingSafeEqual(Buffer.from(expected), Buffer.from(signatureHeader));
    if (!isValid) {
      throw new UnauthorizedException('Invalid signature');
    }
  }
}
