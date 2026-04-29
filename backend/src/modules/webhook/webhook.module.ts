import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LoggingModule } from '../logging/logging.module';
import { RoutingModule } from '../routing/routing.module';
import { WebhookController } from './webhook.controller';
import { WebhookService } from './webhook.service';

@Module({
  imports: [ConfigModule, LoggingModule, RoutingModule],
  controllers: [WebhookController],
  providers: [WebhookService],
})
export class WebhookModule {}
