import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { EntityNotFoundHelper } from '../../common/helpers/entity-not-found.helper';
import { mapNotification } from '../../common/mappers/domain.mappers';
import { ListEntityDto } from '../../common/mappers/list-entity.mapper';
import {
  restoreData,
  softDeleteData,
  tenantActiveWhere,
  tenantTrashedWhere,
} from '../../common/services/soft-delete-crud.helper';

@Injectable()
export class NotificationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly helpers: EntityNotFoundHelper,
  ) {}

  private async findOrThrow(tenantId: string, id: string) {
    const record = await this.prisma.notification.findFirst({
      where: { id, tenantId },
    });
    if (!record) this.helpers.throwNotFound('Notification');
    return record;
  }

  async list(tenantId: string): Promise<ListEntityDto[]> {
    const records = await this.prisma.notification.findMany({
      where: tenantActiveWhere(tenantId),
      orderBy: { createdAt: 'desc' },
    });
    return records.map(mapNotification);
  }

  async listTrashed(tenantId: string): Promise<ListEntityDto[]> {
    const records = await this.prisma.notification.findMany({
      where: tenantTrashedWhere(tenantId),
      orderBy: { createdAt: 'desc' },
    });
    return records.map(mapNotification);
  }

  async get(tenantId: string, id: string): Promise<ListEntityDto> {
    return mapNotification(await this.findOrThrow(tenantId, id));
  }

  async create(
    tenantId: string,
    body: { name?: string; status?: string; userId?: string },
  ): Promise<ListEntityDto> {
    const record = await this.prisma.notification.create({
      data: {
        tenantId,
        userId: body.userId,
        title: body.name ?? 'Notification',
        status: body.status ?? 'active',
      },
    });
    return mapNotification(record);
  }

  async markRead(tenantId: string, ids: string[] | { id: string }) {
    const idList = Array.isArray(ids) ? ids : [ids.id];
    for (const id of idList) {
      await this.findOrThrow(tenantId, id);
      await this.prisma.notification.update({
        where: { id },
        data: { read: true, status: 'read' },
      });
    }
    return { updated: idList.length };
  }

  async markAllRead(tenantId: string) {
    await this.prisma.notification.updateMany({
      where: { ...tenantActiveWhere(tenantId), read: false },
      data: { read: true, status: 'read' },
    });
    return { updated: true };
  }

  async softDelete(tenantId: string, id: string): Promise<ListEntityDto> {
    await this.findOrThrow(tenantId, id);
    const updated = await this.prisma.notification.update({
      where: { id },
      data: softDeleteData(),
    });
    return mapNotification(updated);
  }

  async restore(tenantId: string, id: string): Promise<ListEntityDto> {
    const record = await this.prisma.notification.findFirst({
      where: { id, ...tenantTrashedWhere(tenantId) },
    });
    if (!record) this.helpers.throwNotFound('Notification');
    const updated = await this.prisma.notification.update({
      where: { id },
      data: restoreData(),
    });
    return mapNotification(updated);
  }

  async remove(tenantId: string, id: string) {
    await this.findOrThrow(tenantId, id);
    await this.prisma.notification.delete({ where: { id } });
    return { id, deleted: true };
  }
}
