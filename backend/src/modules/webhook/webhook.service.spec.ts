import { ConfigService } from '@nestjs/config';
import { SettingsService } from '../settings/settings.service';
import { WebhookService } from './webhook.service';

describe('WebhookService', () => {
  const config = {
    get: (key: string) =>
      ({
        META_VERIFY_TOKEN: 'token123',
        META_APP_SECRET: 'secret123',
      })[key],
  } as ConfigService;
  const settings = {
    getEffectiveVerifyToken: async () => 'token123',
    getEffectiveAppSecret: async () => 'secret123',
  } as unknown as SettingsService;
  const service = new WebhookService(config, settings);

  it('verifica challenge correctamente', async () => {
    await expect(service.verifyChallenge('subscribe', 'token123', 'abc')).resolves.toBe('abc');
  });
});
