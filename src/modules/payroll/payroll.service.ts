import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { HrRecordsService } from '../../common/services/hr-records.service';
import { QUEUE_PAYROLL } from '../../queue/queue.constants';

const ENTITY = 'payroll';

@Injectable()
export class PayrollService {
  constructor(
    private readonly hr: HrRecordsService,
    @InjectQueue(QUEUE_PAYROLL) private readonly payrollQueue: Queue,
  ) {}

  list(tenantId: string) {
    return this.hr.list(tenantId, ENTITY);
  }
  get(tenantId: string, id: string) {
    return this.hr.getById(tenantId, ENTITY, id);
  }
  generate(tenantId: string, body: Record<string, string>) {
    return { status: 'generated', period: body.period ?? 'current', tenantId };
  }
  async run(tenantId: string, body: Record<string, string>) {
    const job = await this.payrollQueue.add('run', {
      tenantId,
      period: body.period ?? 'current',
    });
    return { status: 'queued', jobId: job.id };
  }
  slips(_tenantId: string, employeeId: string) {
    return { employeeId, slips: [] };
  }
  summary(tenantId: string) {
    return { tenantId, total: 450000, currency: 'USD' };
  }
  history(tenantId: string) {
    return this.hr.list(tenantId, ENTITY);
  }
  create(tenantId: string, body: { name?: string }) {
    return this.hr.createStub(tenantId, ENTITY, body.name ?? 'Payroll');
  }
  update(
    tenantId: string,
    id: string,
    body: { name?: string; status?: string },
  ) {
    return this.hr.getById(tenantId, ENTITY, id).then((e) => ({
      ...e,
      name: body.name ?? e.name,
      status: body.status ?? e.status,
    }));
  }
  remove(_tenantId: string, id: string) {
    return { id, deleted: true };
  }
}
