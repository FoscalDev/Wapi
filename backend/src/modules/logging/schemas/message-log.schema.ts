import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type MessageLogDocument = HydratedDocument<MessageLog>;

@Schema({ collection: 'message_logs', timestamps: false })
export class MessageLog {
  @Prop({ default: 'incoming_message' })
  event_type!: string;

  @Prop({ index: true })
  phone_number_id!: string;

  @Prop({ index: true })
  display_phone_number!: string;

  @Prop({ index: true })
  from!: string;

  @Prop()
  message_type!: string;

  @Prop()
  message_content!: string;

  @Prop({ type: Object, required: true })
  raw_payload!: Record<string, unknown>;

  @Prop({ index: true, default: () => new Date() })
  received_at!: Date;
}

export const MessageLogSchema = SchemaFactory.createForClass(MessageLog);
MessageLogSchema.index({ phone_number_id: 1, received_at: -1 });
