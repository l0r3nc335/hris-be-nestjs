import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigService } from '@nestjs/config';
import { QUEUE_EMAIL, QUEUE_EXPORTS, QUEUE_PAYROLL } from './queue.constants';
import { EmailProcessor } from './processors/email.processor';
import { PayrollProcessor } from './processors/payroll.processor';
import { ExportsProcessor } from './processors/exports.processor';

@Module({
  imports: [
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
  providers: [EmailProcessor, PayrollProcessor, ExportsProcessor],
  exports: [BullModule],
})
export class QueueModule {}
