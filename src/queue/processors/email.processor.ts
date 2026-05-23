import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { QUEUE_EMAIL } from '../queue.constants';

@Processor(QUEUE_EMAIL)
export class EmailProcessor extends WorkerHost {
  private readonly logger = new Logger(EmailProcessor.name);

  process(job: Job<{ to: string; subject: string; body: string }>) {
    this.logger.log(
      `Email job ${job.id}: ${job.data.subject} -> ${job.data.to}`,
    );
    return { sent: true };
  }
}
