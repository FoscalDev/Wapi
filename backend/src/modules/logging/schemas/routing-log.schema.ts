import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type RoutingLogDocument = HydratedDocument<RoutingLog>;

@Schema({ collection: 'routing_logs', timestamps: false })
export class RoutingLog {
  @Prop({ default: 'routing' })
  event_type!: string;

  @Prop({ index: true })
  phone_number_id!: string;

  @Prop()
  target_webhook!: string;

  @Prop()
  app_name!: string;

  @Prop({ index: true })
  status!: 'pending' | 'success' | 'failed';

  @Prop()
  http_status?: number;

  @Prop({ type: Object })
  response_body?: Record<string, unknown>;

  @Prop()
  error_message?: string;

  @Prop({ default: 1 })
  attempts!: number;

  @Prop()
  latency_ms?: number;

  @Prop({ index: true, default: () => new Date() })
  processed_at!: Date;
}

export const RoutingLogSchema = SchemaFactory.createForClass(RoutingLog);
RoutingLogSchema.index({ phone_number_id: 1, processed_at: -1 });
