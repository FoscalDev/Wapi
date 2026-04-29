import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type WebhookSettingsDocument = HydratedDocument<WebhookSettings>;

@Schema({ collection: 'webhook_settings', timestamps: true })
export class WebhookSettings {
  @Prop({ required: true, default: 'meta', unique: true })
  provider!: string;

  @Prop({ required: true })
  verify_token!: string;

  @Prop({ required: true })
  app_secret!: string;
}

export const WebhookSettingsSchema = SchemaFactory.createForClass(WebhookSettings);
