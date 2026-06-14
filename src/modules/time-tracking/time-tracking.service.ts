import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { EntityNotFoundHelper } from '../../common/helpers/entity-not-found.helper';
import { mapTimeLog } from '../../common/mappers/domain.mappers';
import { ListEntityDto } from '../../common/mappers/list-entity.mapper';
import {
  restoreData,
  softDeleteData,
  tenantActiveWhere,
  tenantTrashedWhere,
} from '../../common/services/soft-delete-crud.helper';

@Injectable()
export class TimeTrackingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly helpers: EntityNotFoundHelper,
  ) {}

  private async findOrThrow(tenantId: string, id: string) {
    const record = await this.prisma.timeLog.findFirst({
      where: { id, tenantId },
    });
    if (!record) this.helpers.throwNotFound('TimeLog');
    return record;
  }

  async list(tenantId: string): Promise<ListEntityDto[]> {
    const records = await this.prisma.timeLog.findMany({
      where: tenantActiveWhere(tenantId),
      orderBy: { createdAt: 'desc' },
    });
    return records.map(mapTimeLog);
  }

  async listTrashed(tenantId: string): Promise<ListEntityDto[]> {
    const records = await this.prisma.timeLog.findMany({
      where: tenantTrashedWhere(tenantId),
      orderBy: { createdAt: 'desc' },
    });
    return records.map(mapTimeLog);
  }

  async get(tenantId: string, id: string): Promise<ListEntityDto> {
    return mapTimeLog(await this.findOrThrow(tenantId, id));
  }

  async start(tenantId: string, body: Record<string, string>) {
    const employee = await this.prisma.employee.findFirst({ where: { tenantId } });
    const record = await this.prisma.timeLog.create({
      data: {
        tenantId,
        employeeId: body.employeeId ?? employee?.id ?? '',
        status: 'running',
        startedAt: new Date(),
      },
    });
    return mapTimeLog(record);
  }

  async stop(tenantId: string, body: Record<string, string>) {
    const record = await this.prisma.timeLog.findFirst({
      where: { tenantId, employeeId: body.employeeId, status: 'running' },
      orderBy: { startedAt: 'desc' },
    });
    if (!record) this.helpers.throwNotFound('TimeLog');
    const updated = await this.prisma.timeLog.update({
      where: { id: record.id },
      data: { status: 'stopped', endedAt: new Date() },
    });
    return mapTimeLog(updated);
  }

  async today(tenantId: string, employeeId: string) {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const records = await this.prisma.timeLog.findMany({
      where: {
        tenantId: tenantId || undefined,
        employeeId,
        startedAt: { gte: start },
      },
    });
    return records.map(mapTimeLog);
  }

  async byEmployee(tenantId: string, employeeId: string) {
    const records = await this.prisma.timeLog.findMany({
      where: { ...tenantActiveWhere(tenantId), employeeId },
      orderBy: { startedAt: 'desc' },
    });
    return records.map(mapTimeLog);
  }

  async create(
    tenantId: string,
    body: { name?: string; status?: string; employeeId?: string },
  ): Promise<ListEntityDto> {
    const employee = await this.prisma.employee.findFirst({
      where: { tenantId },
    });
    const record = await this.prisma.timeLog.create({
      data: {
        tenantId,
        employeeId: body.employeeId ?? employee?.id ?? '',
        status: body.status ?? 'running',
        startedAt: new Date(),
      },
    });
    return mapTimeLog(record);
  }

  async update(
    tenantId: string,
    id: string,
    body: { name?: string; status?: string },
  ): Promise<ListEntityDto> {
    await this.findOrThrow(tenantId, id);
    const updated = await this.prisma.timeLog.update({
      where: { id },
      data: { status: body.status },
    });
    return mapTimeLog(updated);
  }

  async softDelete(tenantId: string, id: string): Promise<ListEntityDto> {
    await this.findOrThrow(tenantId, id);
    const updated = await this.prisma.timeLog.update({
      where: { id },
      data: softDeleteData(),
    });
    return mapTimeLog(updated);
  }

  async restore(tenantId: string, id: string): Promise<ListEntityDto> {
    const record = await this.prisma.timeLog.findFirst({
      where: { id, ...tenantTrashedWhere(tenantId) },
    });
    if (!record) this.helpers.throwNotFound('TimeLog');
    const updated = await this.prisma.timeLog.update({
      where: { id },
      data: restoreData(),
    });
    return mapTimeLog(updated);
  }

  async remove(tenantId: string, id: string) {
    await this.findOrThrow(tenantId, id);
    await this.prisma.timeLog.delete({ where: { id } });
    return { id, deleted: true };
  }
}
