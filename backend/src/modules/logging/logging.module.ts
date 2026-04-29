import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PermissionsGuard } from '../auth/permissions.guard';
import { LogsController } from './logging.controller';
import { LoggingService } from './logging.service';
import { MessageLog, MessageLogSchema } from './schemas/message-log.schema';
import { RoutingLog, RoutingLogSchema } from './schemas/routing-log.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: MessageLog.name, schema: MessageLogSchema },
      { name: RoutingLog.name, schema: RoutingLogSchema },
    ]),
  ],
  providers: [LoggingService, PermissionsGuard],
  controllers: [LogsController],
  exports: [LoggingService, MongooseModule],
})
export class LoggingModule {}
