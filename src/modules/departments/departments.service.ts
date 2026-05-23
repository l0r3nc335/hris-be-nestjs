import { Injectable } from '@nestjs/common';
import { HrRecordsService } from '../../common/services/hr-records.service';

const ENTITY = 'departments';

@Injectable()
export class DepartmentsService {
  constructor(private readonly hr: HrRecordsService) {}

  list(tenantId: string) {
    return this.hr.list(tenantId, ENTITY);
  }
  get(tenantId: string, id: string) {
    return this.hr.getById(tenantId, ENTITY, id);
  }
  employees(tenantId: string, departmentId: string) {
    void departmentId;
    return this.hr.list(tenantId, 'employees');
  }
  create(tenantId: string, body: { name?: string }) {
    return this.hr.createStub(tenantId, ENTITY, body.name ?? 'Department');
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
