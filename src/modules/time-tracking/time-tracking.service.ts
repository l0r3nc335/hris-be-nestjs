import { Injectable } from '@nestjs/common';
import { HrRecordsService } from '../../common/services/hr-records.service';

const ENTITY = 'time-logs';

@Injectable()
export class TimeTrackingService {
  constructor(private readonly hr: HrRecordsService) {}

  list(tenantId: string) {
    return this.hr.list(tenantId, ENTITY);
  }
  get(tenantId: string, id: string) {
    return this.hr.getById(tenantId, ENTITY, id);
  }
  start(tenantId: string, body: Record<string, string>) {
    return {
      ...this.hr.stubEntity(tenantId, 'Timer'),
      status: 'running',
      ...body,
    };
  }
  stop(tenantId: string, body: Record<string, string>) {
    return {
      ...this.hr.stubEntity(tenantId, 'Timer'),
      status: 'stopped',
      ...body,
    };
  }
  today(_tenantId: string, employeeId: string) {
    return {
      employeeId,
      logs: [],
      date: new Date().toISOString().slice(0, 10),
    };
  }
  byEmployee(tenantId: string, employeeId: string) {
    return this.hr
      .list(tenantId, ENTITY)
      .then((items) => items.map((i) => ({ ...i, employeeId })));
  }
  create(tenantId: string, body: { name?: string }) {
    return this.hr.createStub(tenantId, ENTITY, body.name ?? 'TimeLog');
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
