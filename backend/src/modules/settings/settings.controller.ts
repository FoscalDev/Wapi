import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common';
import { IsString, MinLength } from 'class-validator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RequirePermissions } from '../auth/permissions.decorator';
import { PermissionsGuard } from '../auth/permissions.guard';
import { SettingsService } from './settings.service';

class UpdateWebhookSettingsDto {
  @IsString()
  @MinLength(3)
  verify_token!: string;

  @IsString()
  @MinLength(6)
  app_secret!: string;
}

@UseGuards(JwtAuthGuard, PermissionsGuard)
@RequirePermissions('settings.manage')
@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get('webhook')
  getWebhook() {
    return this.settingsService.getWebhookSettings();
  }

  @Put('webhook')
  updateWebhook(@Body() dto: UpdateWebhookSettingsDto) {
    return this.settingsService.upsertWebhookSettings(dto.verify_token, dto.app_secret);
  }
}
