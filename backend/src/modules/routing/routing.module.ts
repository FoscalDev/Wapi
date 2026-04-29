import { Module, forwardRef } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigsModule } from '../config/config.module';
import { LoggingModule } from '../logging/logging.module';
import { RetryModule } from '../retry/retry.module';
import { RoutingService } from './routing.service';

@Module({
  imports: [HttpModule, ConfigsModule, LoggingModule, forwardRef(() => RetryModule)],
  providers: [RoutingService],
  exports: [RoutingService],
})
export class RoutingModule {}
