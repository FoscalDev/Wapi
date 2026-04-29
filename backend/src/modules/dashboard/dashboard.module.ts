import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { DashboardController } from './dashboard.controller';
import { MessageLog, MessageLogSchema } from '../logging/schemas/message-log.schema';
import { RoutingLog, RoutingLogSchema } from '../logging/schemas/routing-log.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: MessageLog.name, schema: MessageLogSchema },
      { name: RoutingLog.name, schema: RoutingLogSchema },
    ]),
  ],
  controllers: [DashboardController],
  providers: [JwtAuthGuard, PermissionsGuard],
})
export class DashboardModule {}
