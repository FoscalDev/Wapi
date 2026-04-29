import { Controller, Get, UseGuards } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { MessageLog } from '../logging/schemas/message-log.schema';
import { RoutingLog } from '../logging/schemas/routing-log.schema';

@Controller()
export class DashboardController {
  constructor(
    @InjectModel(MessageLog.name) private readonly messageModel: Model<MessageLog>,
    @InjectModel(RoutingLog.name) private readonly routingModel: Model<RoutingLog>,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get('dashboard/summary')
  async summary() {
    const [incoming, success, failed, avgLatency] = await Promise.all([
      this.messageModel.countDocuments(),
      this.routingModel.countDocuments({ status: 'success' }),
      this.routingModel.countDocuments({ status: 'failed' }),
      this.routingModel.aggregate([
        { $match: { latency_ms: { $ne: null } } },
        { $group: { _id: null, value: { $avg: '$latency_ms' } } },
      ]),
    ]);
    return {
      incoming_messages: incoming,
      routing_success: success,
      routing_failed: failed,
      avg_latency_ms: avgLatency[0]?.value ?? 0,
    };
  }

  @Get('health')
  health() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }
}
