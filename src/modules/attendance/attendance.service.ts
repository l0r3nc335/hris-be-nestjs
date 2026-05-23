import { Injectable } from '@nestjs/common';
import { HrRecordsService } from '../../common/services/hr-records.service';

const ENTITY = 'attendance';

@Injectable()
export class AttendanceService {
  constructor(private readonly hr: HrRecordsService) {}

  list(tenantId: string) {
    return this.hr.list(tenantId, ENTITY);
  }
  get(tenantId: string, id: string) {
    return this.hr.getById(tenantId, ENTITY, id);
  }
  checkIn(tenantId: string, body: Record<string, string>) {
    return {
      ...this.hr.stubEntity(tenantId, 'Check-in'),
      type: 'check-in',
      ...body,
    };
  }
  checkOut(tenantId: string, body: Record<string, string>) {
    return {
      ...this.hr.stubEntity(tenantId, 'Check-out'),
      type: 'check-out',
      ...body,
    };
  }
  today(tenantId: string) {
    return this.hr.list(tenantId, ENTITY);
  }
  range(_tenantId: string, _start?: string, _end?: string) {
    return { records: [], start: _start, end: _end };
  }
  summary(_tenantId: string, employeeId: string) {
    return { employeeId, daysPresent: 20, daysAbsent: 2 };
  }
  byEmployee(tenantId: string, employeeId: string) {
    return this.hr
      .list(tenantId, ENTITY)
      .then((items) => items.map((i) => ({ ...i, employeeId })));
  }
  create(tenantId: string, body: { name?: string }) {
    return this.hr.createStub(tenantId, ENTITY, body.name ?? 'Attendance');
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
