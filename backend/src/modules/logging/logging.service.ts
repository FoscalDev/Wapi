import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MessageLog } from './schemas/message-log.schema';
import { RoutingLog } from './schemas/routing-log.schema';

@Injectable()
export class LoggingService {
  constructor(
    @InjectModel(MessageLog.name) private readonly messageModel: Model<MessageLog>,
    @InjectModel(RoutingLog.name) private readonly routingModel: Model<RoutingLog>,
  ) {}

  createMessageLog(payload: Partial<MessageLog>) {
    return this.messageModel.create(payload);
  }

  createRoutingLog(payload: Partial<RoutingLog>) {
    return this.routingModel.create(payload);
  }

  getMessageLogs(filters: Record<string, string>) {
    const query: Record<string, unknown> = {};
    if (filters.phone_number_id) query.phone_number_id = filters.phone_number_id;
    if (filters.message_type) query.message_type = filters.message_type;
    return this.messageModel.find(query).sort({ received_at: -1 }).limit(200).lean();
  }

  getRoutingLogs(filters: Record<string, string>) {
    const query: Record<string, unknown> = {};
    if (filters.phone_number_id) query.phone_number_id = filters.phone_number_id;
    if (filters.status) query.status = filters.status;
    return this.routingModel.find(query).sort({ processed_at: -1 }).limit(200).lean();
  }
}
