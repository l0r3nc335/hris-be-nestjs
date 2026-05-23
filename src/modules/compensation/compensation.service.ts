import { Injectable } from '@nestjs/common';
import { HrRecordsService } from '../../common/services/hr-records.service';

const ENTITY = 'compensation';

@Injectable()
export class CompensationService {
  constructor(private readonly hr: HrRecordsService) {}

  list(tenantId: string) {
    return this.hr.list(tenantId, ENTITY);
  }
  get(tenantId: string, id: string) {
    return this.hr.getById(tenantId, ENTITY, id);
  }
  byEmployee(_tenantId: string, employeeId: string) {
    return { employeeId, baseSalary: 75000 };
  }
  adjust(tenantId: string, employeeId: string, body: Record<string, unknown>) {
    return { employeeId, adjustment: body, status: 'adjusted', tenantId };
  }
  salaryStructures(tenantId: string) {
    return this.hr.list(tenantId, 'salary-structures');
  }
  createStructure(tenantId: string, body: { name?: string }) {
    return this.hr.createStub(
      tenantId,
      'salary-structures',
      body.name ?? 'Structure',
    );
  }
}
