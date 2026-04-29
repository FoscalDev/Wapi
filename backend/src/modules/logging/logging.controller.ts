import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { LoggingService } from './logging.service';

@UseGuards(JwtAuthGuard)
@Controller('logs')
export class LogsController {
  constructor(private readonly loggingService: LoggingService) {}

  @Get('messages')
  listMessages(@Query() query: Record<string, string>) {
    return this.loggingService.getMessageLogs(query);
  }

  @Get('routing')
  listRouting(@Query() query: Record<string, string>) {
    return this.loggingService.getRoutingLogs(query);
  }
}
