import { createHmac, timingSafeEqual } from 'crypto';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class WebhookService {
  constructor(private readonly config: ConfigService) {}

  verifyChallenge(mode: string, token: string, challenge: string) {
    const verifyToken = this.config.get<string>('META_VERIFY_TOKEN');
    if (mode === 'subscribe' && token === verifyToken) {
      return challenge;
    }
    throw new UnauthorizedException('Invalid verify token');
  }

  validateSignature(rawBody: Buffer, signatureHeader?: string) {
    const appSecret = this.config.get<string>('META_APP_SECRET');
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
