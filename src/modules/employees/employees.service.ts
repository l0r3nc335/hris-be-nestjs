import { Injectable } from '@nestjs/common';
import { HrRecordsService } from '../../common/services/hr-records.service';

const ENTITY = 'employees';

@Injectable()
export class EmployeesService {
  constructor(private readonly hr: HrRecordsService) {}

  list(tenantId: string) {
    return this.hr.list(tenantId, ENTITY);
  }
  get(tenantId: string, id: string) {
    return this.hr.getById(tenantId, ENTITY, id);
  }
  active(tenantId: string) {
    return this.hr.list(tenantId, ENTITY);
  }
  resigned(tenantId: string) {
    return this.hr
      .list(tenantId, ENTITY)
      .then((items) => items.map((i) => ({ ...i, status: 'resigned' })));
  }
  byDepartment(tenantId: string, departmentId: string) {
    void departmentId;
    return this.hr.list(tenantId, ENTITY);
  }
  byManager(tenantId: string, managerId: string) {
    void managerId;
    return this.hr.list(tenantId, ENTITY);
  }
  employmentHistory(tenantId: string, employeeId: string) {
    return [
      { employeeId, title: 'Software Engineer', from: '2022-01-01', to: null },
    ];
  }
  promote(tenantId: string, id: string, body: Record<string, string>) {
    void body;
    return this.update(tenantId, id, { status: 'promoted' });
  }
  transfer(tenantId: string, id: string, body: Record<string, string>) {
    void body;
    return this.update(tenantId, id, { status: 'transferred' });
  }
  create(tenantId: string, body: { name?: string }) {
    return this.hr.createStub(tenantId, ENTITY, body.name ?? 'Employee');
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
