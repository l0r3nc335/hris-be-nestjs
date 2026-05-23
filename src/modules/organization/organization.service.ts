import { Injectable } from '@nestjs/common';
import { HrRecordsService } from '../../common/services/hr-records.service';

@Injectable()
export class OrganizationService {
  constructor(private readonly hr: HrRecordsService) {}

  chart(tenantId: string) {
    void tenantId;
    return { nodes: [], edges: [] };
  }

  reportingLines(tenantId: string) {
    void tenantId;
    return [];
  }

  positionsTree(tenantId: string) {
    return this.hr.list(tenantId, 'positions');
  }

  getChartNode(tenantId: string, id: string) {
    return this.hr.getById(tenantId, 'org', id).catch(() => ({
      id,
      tenantId,
      name: 'Node',
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));
  }
}
