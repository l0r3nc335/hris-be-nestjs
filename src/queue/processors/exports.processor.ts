import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { QUEUE_EXPORTS } from '../queue.constants';

@Processor(QUEUE_EXPORTS)
export class ExportsProcessor extends WorkerHost {
  private readonly logger = new Logger(ExportsProcessor.name);

  async process(job: Job<{ tenantId: string; reportType: string }>) {
    this.logger.log(`Export job ${job.id}: ${job.data.reportType}`);
    return { url: `/exports/${job.id}.csv` };
  }
}
