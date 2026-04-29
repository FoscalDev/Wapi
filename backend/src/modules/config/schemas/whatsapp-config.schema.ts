import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type WhatsappConfigDocument = HydratedDocument<WhatsappConfig>;

export enum AuthType {
  NONE = 'NONE',
  BEARER = 'BEARER',
  API_KEY = 'API_KEY',
}

@Schema({ collection: 'whatsapp_configs', timestamps: true })
export class WhatsappConfig {
  @Prop({ required: true })
  app_name!: string;

  @Prop({ required: true, unique: true, index: true })
  phone_number_id!: string;

  @Prop({ required: true, index: true })
  display_phone_number!: string;

  @Prop({ required: true })
  webhook_url!: string;

  @Prop({ enum: AuthType, default: AuthType.NONE })
  auth_type!: AuthType;

  @Prop()
  auth_token?: string;

  @Prop({ default: true, index: true })
  is_active!: boolean;
}

export const WhatsappConfigSchema = SchemaFactory.createForClass(WhatsappConfig);
WhatsappConfigSchema.index({ phone_number_id: 1, is_active: 1 });
