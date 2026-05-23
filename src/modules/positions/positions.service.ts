import { Injectable } from '@nestjs/common';
import { HrRecordsService } from '../../common/services/hr-records.service';

const ENTITY = 'positions';

@Injectable()
export class PositionsService {
  constructor(private readonly hr: HrRecordsService) {}

  list(tenantId: string) {
    return this.hr.list(tenantId, ENTITY);
  }
  get(tenantId: string, id: string) {
    return this.hr.getById(tenantId, ENTITY, id);
  }
  create(tenantId: string, body: { name?: string }) {
    return this.hr.createStub(tenantId, ENTITY, body.name ?? 'Positions');
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
  stub(tenantId: string, label: string) {
    return this.hr.stubEntity(tenantId, label);
  }
}
