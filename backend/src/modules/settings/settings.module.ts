import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PermissionsGuard } from '../auth/permissions.guard';
import { SettingsController } from './settings.controller';
import { SettingsService } from './settings.service';
import { WebhookSettings, WebhookSettingsSchema } from './schemas/webhook-settings.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: WebhookSettings.name, schema: WebhookSettingsSchema },
    ]),
  ],
  providers: [SettingsService, PermissionsGuard],
  controllers: [SettingsController],
  exports: [SettingsService],
})
export class SettingsModule {}
