import { Injectable } from '@nestjs/common';
import { HrRecordsService } from '../../common/services/hr-records.service';

const ENTITY = 'leaves';

@Injectable()
export class LeaveService {
  constructor(private readonly hr: HrRecordsService) {}

  list(tenantId: string) {
    return this.hr.list(tenantId, ENTITY);
  }
  get(tenantId: string, id: string) {
    return this.hr.getById(tenantId, ENTITY, id);
  }
  pending(tenantId: string) {
    return this.hr
      .list(tenantId, ENTITY)
      .then((items) => items.map((i) => ({ ...i, status: 'pending' })));
  }
  balance(_tenantId: string, employeeId: string) {
    return { employeeId, annual: 15, used: 3, remaining: 12 };
  }
  history(tenantId: string, employeeId: string) {
    return this.hr
      .list(tenantId, ENTITY)
      .then((items) => items.map((i) => ({ ...i, employeeId })));
  }
  apply(tenantId: string, body: Record<string, string>) {
    return this.hr.createStub(
      tenantId,
      ENTITY,
      body.type ?? 'Leave',
      'pending',
    );
  }
  approve(tenantId: string, id: string) {
    return this.update(tenantId, id, { status: 'approved' });
  }
  reject(tenantId: string, id: string) {
    return this.update(tenantId, id, { status: 'rejected' });
  }
  cancel(tenantId: string, id: string) {
    return this.update(tenantId, id, { status: 'cancelled' });
  }
  create(tenantId: string, body: { name?: string }) {
    return this.hr.createStub(tenantId, ENTITY, body.name ?? 'Leave');
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
