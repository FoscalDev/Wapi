import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LoggingModule } from '../logging/logging.module';
import { RoutingModule } from '../routing/routing.module';
import { RetryService } from './retry.service';
import { RetryJobLog, RetryJobLogSchema } from './schemas/retry-job-log.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: RetryJobLog.name, schema: RetryJobLogSchema }]),
    LoggingModule,
    forwardRef(() => RoutingModule),
  ],
  providers: [RetryService],
  exports: [RetryService],
})
export class RetryModule {}
