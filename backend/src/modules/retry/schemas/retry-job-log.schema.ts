import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type RetryJobLogDocument = HydratedDocument<RetryJobLog>;

@Schema({ collection: 'retry_job_logs', timestamps: true })
export class RetryJobLog {
  @Prop({ index: true })
  phone_number_id!: string;

  @Prop({ index: true })
  status!: 'pending' | 'success' | 'failed';

  @Prop({ default: 0 })
  attempts!: number;

  @Prop({ type: Object, required: true })
  payload!: Record<string, unknown>;

  @Prop({ default: null })
  last_error?: string;

  @Prop({ default: () => new Date(), index: true })
  next_retry_at!: Date;
}

export const RetryJobLogSchema = SchemaFactory.createForClass(RetryJobLog);
