import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { getQueueToken } from '@nestjs/bullmq';
import { ConfigService } from '@nestjs/config';
import { QUEUE_EMAIL, QUEUE_EXPORTS, QUEUE_PAYROLL } from './queue.constants';
import { EmailProcessor } from './processors/email.processor';
import { PayrollProcessor } from './processors/payroll.processor';
import { ExportsProcessor } from './processors/exports.processor';

const queueMock = {
  add: async () => ({ id: 'test-job' }),
};

const isTestEnv = process.env.NODE_ENV === 'test';

@Module({
  imports: isTestEnv
    ? []
    : [
        BullModule.forRootAsync({
          inject: [ConfigService],
          useFactory: (config: ConfigService) => ({
            connection: {
              host: config.get<string>('redis.host'),
              port: config.get<number>('redis.port'),
            },
          }),
        }),
        BullModule.registerQueue(
          { name: QUEUE_EMAIL },
          { name: QUEUE_PAYROLL },
          { name: QUEUE_EXPORTS },
        ),
      ],
  providers: isTestEnv
    ? [
        { provide: getQueueToken(QUEUE_EMAIL), useValue: queueMock },
        { provide: getQueueToken(QUEUE_PAYROLL), useValue: queueMock },
        { provide: getQueueToken(QUEUE_EXPORTS), useValue: queueMock },
      ]
    : [EmailProcessor, PayrollProcessor, ExportsProcessor],
  exports: isTestEnv
    ? [
        getQueueToken(QUEUE_EMAIL),
        getQueueToken(QUEUE_PAYROLL),
        getQueueToken(QUEUE_EXPORTS),
      ]
    : [BullModule],
})
export class QueueModule {}
