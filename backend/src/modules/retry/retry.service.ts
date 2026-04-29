import { Inject, Injectable, Logger, OnModuleDestroy, OnModuleInit, forwardRef } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RoutingService } from '../routing/routing.service';
import { RetryJobLog } from './schemas/retry-job-log.schema';

@Injectable()
export class RetryService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RetryService.name);
  private intervalRef?: NodeJS.Timeout;

  constructor(
    @InjectModel(RetryJobLog.name)
    private readonly retryLogModel: Model<RetryJobLog>,
    @Inject(forwardRef(() => RoutingService))
    private readonly routingService: RoutingService,
  ) {}

  onModuleInit() {
    this.intervalRef = setInterval(() => {
      void this.processDueRetries();
    }, 2000);
  }

  onModuleDestroy() {
    if (this.intervalRef) {
      clearInterval(this.intervalRef);
    }
  }

  async enqueueRetry(
    phoneNumberId: string,
    payload: Record<string, unknown>,
    attempt: number,
    lastError: string,
  ) {
    const delay = Math.pow(2, attempt) * 1000;
    await this.retryLogModel.create({
      phone_number_id: phoneNumberId,
      status: 'pending',
      attempts: attempt,
      payload,
      last_error: lastError,
      next_retry_at: new Date(Date.now() + delay),
    });
  }

  private async processDueRetries() {
    const now = new Date();
    const jobs = await this.retryLogModel
      .find({
        status: 'pending',
        next_retry_at: { $lte: now },
      })
      .sort({ next_retry_at: 1 })
      .limit(20);

    for (const job of jobs) {
      try {
        const success = await this.routingService.routePayload(
          job.payload as Record<string, unknown>,
          job.attempts,
          false,
        );
        if (success) {
          job.status = 'success';
          await job.save();
          continue;
        }
        if (job.attempts >= 5) {
          job.status = 'failed';
          await job.save();
          continue;
        }
        job.attempts += 1;
        job.last_error = 'Retry failed';
        job.next_retry_at = new Date(Date.now() + Math.pow(2, job.attempts) * 1000);
        await job.save();
      } catch (error) {
        this.logger.error(`Error procesando retry: ${(error as Error).message}`);
      }
    }
  }
}
