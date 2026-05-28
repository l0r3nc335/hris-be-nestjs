import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { QUEUE_PAYROLL } from '../queue.constants';

@Processor(QUEUE_PAYROLL)
export class PayrollProcessor extends WorkerHost {
  private readonly logger = new Logger(PayrollProcessor.name);

  async process(job: Job<{ tenantId: string; period: string }>) {
    this.logger.log(
      `Payroll run job ${job.id} for tenant ${job.data.tenantId}`,
    );
    return { status: 'completed', period: job.data.period };
  }
}
