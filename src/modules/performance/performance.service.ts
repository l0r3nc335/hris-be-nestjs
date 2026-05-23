import { Injectable } from '@nestjs/common';
import { HrRecordsService } from '../../common/services/hr-records.service';

const ENTITY = 'performance-reviews';

@Injectable()
export class PerformanceService {
  constructor(private readonly hr: HrRecordsService) {}

  list(tenantId: string) {
    return this.hr.list(tenantId, ENTITY);
  }
  get(tenantId: string, id: string) {
    return this.hr.getById(tenantId, ENTITY, id);
  }
  submit(tenantId: string, id: string) {
    return this.update(tenantId, id, { status: 'submitted' });
  }
  approve(tenantId: string, id: string) {
    return this.update(tenantId, id, { status: 'approved' });
  }
  ratings(_tenantId: string, employeeId: string) {
    return { employeeId, ratings: [{ period: '2025', score: 4.2 }] };
  }
  create(tenantId: string, body: { name?: string }) {
    return this.hr.createStub(tenantId, ENTITY, body.name ?? 'Review');
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
