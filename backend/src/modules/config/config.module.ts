import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigController } from './config.controller';
import { ConfigServiceApp } from './config.service';
import {
  WhatsappConfig,
  WhatsappConfigSchema,
} from './schemas/whatsapp-config.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: WhatsappConfig.name, schema: WhatsappConfigSchema },
    ]),
  ],
  controllers: [ConfigController],
  providers: [ConfigServiceApp],
  exports: [ConfigServiceApp, MongooseModule],
})
export class ConfigsModule {}
