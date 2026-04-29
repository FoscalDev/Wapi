import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { MongooseModule } from '@nestjs/mongoose';
import { PermissionsGuard } from '../auth/permissions.guard';
import { LoggingModule } from '../logging/logging.module';
import { ConfigController } from './config.controller';
import { ConfigServiceApp } from './config.service';
import {
  WhatsappConfig,
  WhatsappConfigSchema,
} from './schemas/whatsapp-config.schema';

@Module({
  imports: [
    HttpModule,
    LoggingModule,
    MongooseModule.forFeature([
      { name: WhatsappConfig.name, schema: WhatsappConfigSchema },
    ]),
  ],
  controllers: [ConfigController],
  providers: [ConfigServiceApp, PermissionsGuard],
  exports: [ConfigServiceApp, MongooseModule],
})
export class ConfigsModule {}
