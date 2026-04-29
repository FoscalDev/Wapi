import { BadRequestException, Controller, Delete, Get, Query, UseGuards } from '@nestjs/common';
import { IsISO8601 } from 'class-validator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RequirePermissions } from '../auth/permissions.decorator';
import { PermissionsGuard } from '../auth/permissions.guard';
import { LoggingService } from './logging.service';

class DeleteLogsRangeDto {
  @IsISO8601()
  from!: string;

  @IsISO8601()
  to!: string;
}

@UseGuards(JwtAuthGuard, PermissionsGuard)
@RequirePermissions('logs.read')
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

  @Delete('messages')
  @RequirePermissions('logs.manage')
  deleteMessages(@Query() query: DeleteLogsRangeDto) {
    const from = new Date(query.from);
    const to = new Date(query.to);
    if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime()) || from > to) {
      throw new BadRequestException('Rango de fechas invalido');
    }
    return this.loggingService.deleteMessageLogsByDateRange(from, to);
  }

  @Delete('routing')
  @RequirePermissions('logs.manage')
  deleteRouting(@Query() query: DeleteLogsRangeDto) {
    const from = new Date(query.from);
    const to = new Date(query.to);
    if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime()) || from > to) {
      throw new BadRequestException('Rango de fechas invalido');
    }
    return this.loggingService.deleteRoutingLogsByDateRange(from, to);
  }
}
