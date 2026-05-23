import { Global, Module } from '@nestjs/common';
import { HrRecordsService } from './services/hr-records.service';

@Global()
@Module({
  providers: [HrRecordsService],
  exports: [HrRecordsService],
})
export class CommonModule {}
