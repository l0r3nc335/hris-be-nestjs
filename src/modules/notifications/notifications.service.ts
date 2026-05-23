import { Injectable } from '@nestjs/common';
import { HrRecordsService } from '../../common/services/hr-records.service';

const ENTITY = 'notifications';

@Injectable()
export class NotificationsService {
  constructor(private readonly hr: HrRecordsService) {}

  list(tenantId: string) {
    return this.hr.list(tenantId, ENTITY);
  }
  get(tenantId: string, id: string) {
    return this.hr.getById(tenantId, ENTITY, id);
  }
  markRead(_tenantId: string, ids: string[]) {
    return { marked: ids.length };
  }
  markAllRead(tenantId: string) {
    return { marked: 'all', tenantId };
  }
  remove(_tenantId: string, id: string) {
    return { id, deleted: true };
  }
}
