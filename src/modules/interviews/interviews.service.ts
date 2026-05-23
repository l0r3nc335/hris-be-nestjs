import { Injectable } from '@nestjs/common';
import { HrRecordsService } from '../../common/services/hr-records.service';

const ENTITY = 'interviews';

@Injectable()
export class InterviewsService {
  constructor(private readonly hr: HrRecordsService) {}

  list(tenantId: string) {
    return this.hr.list(tenantId, ENTITY);
  }
  get(tenantId: string, id: string) {
    return this.hr.getById(tenantId, ENTITY, id);
  }
  reschedule(tenantId: string, id: string, body: Record<string, string>) {
    return this.update(tenantId, id, { status: 'rescheduled', ...body });
  }
  complete(tenantId: string, id: string) {
    return this.update(tenantId, id, { status: 'completed' });
  }
  create(tenantId: string, body: { name?: string }) {
    return this.hr.createStub(tenantId, ENTITY, body.name ?? 'Interview');
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
