import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { EntityNotFoundHelper } from '../../common/helpers/entity-not-found.helper';
import { mapPosition } from '../../common/mappers/domain.mappers';
import { ListEntityDto } from '../../common/mappers/list-entity.mapper';
import {
  restoreData,
  softDeleteData,
  tenantActiveWhere,
  tenantTrashedWhere,
} from '../../common/services/soft-delete-crud.helper';

@Injectable()
export class PositionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly helpers: EntityNotFoundHelper,
  ) {}

  private async findOrThrow(tenantId: string, id: string) {
    const record = await this.prisma.position.findFirst({
      where: { id, tenantId },
    });
    if (!record) this.helpers.throwNotFound('Position');
    return record;
  }

  async list(tenantId: string): Promise<ListEntityDto[]> {
    const records = await this.prisma.position.findMany({
      where: tenantActiveWhere(tenantId),
      orderBy: { createdAt: 'desc' },
    });
    return records.map(mapPosition);
  }

  async listTrashed(tenantId: string): Promise<ListEntityDto[]> {
    const records = await this.prisma.position.findMany({
      where: tenantTrashedWhere(tenantId),
      orderBy: { createdAt: 'desc' },
    });
    return records.map(mapPosition);
  }

  async get(tenantId: string, id: string): Promise<ListEntityDto> {
    return mapPosition(await this.findOrThrow(tenantId, id));
  }

  async create(
    tenantId: string,
    body: { name?: string; status?: string },
  ): Promise<ListEntityDto> {
    const record = await this.prisma.position.create({
      data: {
        tenantId,
        title: body.name ?? 'Position',
        status: body.status ?? 'active',
      },
    });
    return mapPosition(record);
  }

  async update(
    tenantId: string,
    id: string,
    body: { name?: string; status?: string },
  ): Promise<ListEntityDto> {
    await this.findOrThrow(tenantId, id);
    const updated = await this.prisma.position.update({
      where: { id },
      data: {
        title: body.name,
        status: body.status,
      },
    });
    return mapPosition(updated);
  }

  async softDelete(tenantId: string, id: string): Promise<ListEntityDto> {
    await this.findOrThrow(tenantId, id);
    const updated = await this.prisma.position.update({
      where: { id },
      data: softDeleteData(),
    });
    return mapPosition(updated);
  }

  async restore(tenantId: string, id: string): Promise<ListEntityDto> {
    const record = await this.prisma.position.findFirst({
      where: { id, ...tenantTrashedWhere(tenantId) },
    });
    if (!record) this.helpers.throwNotFound('Position');
    const updated = await this.prisma.position.update({
      where: { id },
      data: restoreData(),
    });
    return mapPosition(updated);
  }

  async remove(tenantId: string, id: string) {
    await this.findOrThrow(tenantId, id);
    await this.prisma.position.delete({ where: { id } });
    return { id, deleted: true };
  }
}
