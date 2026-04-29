import { ConfigService } from '@nestjs/config';
import { WebhookService } from './webhook.service';

describe('WebhookService', () => {
  const config = {
    get: (key: string) =>
      ({
        META_VERIFY_TOKEN: 'token123',
        META_APP_SECRET: 'secret123',
      })[key],
  } as ConfigService;
  const service = new WebhookService(config);

  it('verifica challenge correctamente', () => {
    expect(service.verifyChallenge('subscribe', 'token123', 'abc')).toBe('abc');
  });
});
