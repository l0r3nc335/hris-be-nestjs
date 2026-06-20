import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { PaginatedResponseDto } from '../../common/dto/paginated-response.dto';
import { EntityNotFoundHelper } from '../../common/helpers/entity-not-found.helper';
import { paginate } from '../../common/helpers/pagination.helper';
import { mapAuditLog } from '../../common/mappers/domain.mappers';
import { ListEntityDto } from '../../common/mappers/list-entity.mapper';

@Injectable()
export class AuditService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly helpers: EntityNotFoundHelper,
  ) {}

  async log(data: {
    tenantId: string;
    actorId?: string;
    action: string;
    entity: string;
    entityId?: string;
    metadata?: Record<string, unknown>;
    ip?: string;
    userAgent?: string;
  }) {
    return this.prisma.auditLog.create({
      data: {
        tenantId: data.tenantId,
        actorId: data.actorId,
        action: data.action,
        entity: data.entity,
        entityId: data.entityId,
        metadata: data.metadata as Prisma.InputJsonValue | undefined,
        ip: data.ip,
        userAgent: data.userAgent,
      },
    });
  }

  async list(
    tenantId: string,
    query: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<ListEntityDto>> {
    return paginate(this.prisma.auditLog, {
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
      mapFn: mapAuditLog,
      query,
      searchFields: ['action', 'entity'],
      resolveStatusFilter: () => ({}),
    });
  }

  async byEntity(tenantId: string, entity: string, entityId: string) {
    const records = await this.prisma.auditLog.findMany({
      where: { tenantId, entity, entityId },
      orderBy: { createdAt: 'desc' },
    });
    return records.map(mapAuditLog);
  }

  async byUser(tenantId: string, userId: string) {
    const records = await this.prisma.auditLog.findMany({
      where: { tenantId, actorId: userId },
      orderBy: { createdAt: 'desc' },
    });
    return records.map(mapAuditLog);
  }

  async getById(tenantId: string, id: string): Promise<ListEntityDto> {
    const record = await this.prisma.auditLog.findFirst({
      where: { id, tenantId },
    });
    if (!record) this.helpers.throwNotFound('AuditLog');
    return mapAuditLog(record);
  }
}
