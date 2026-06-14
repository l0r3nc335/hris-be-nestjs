import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { EntityNotFoundHelper } from '../../common/helpers/entity-not-found.helper';
import { mapPerformance } from '../../common/mappers/domain.mappers';
import { ListEntityDto } from '../../common/mappers/list-entity.mapper';
import {
  restoreData,
  softDeleteData,
  tenantActiveWhere,
  tenantTrashedWhere,
} from '../../common/services/soft-delete-crud.helper';

@Injectable()
export class PerformanceService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly helpers: EntityNotFoundHelper,
  ) {}

  private async findOrThrow(tenantId: string, id: string) {
    const record = await this.prisma.performanceReview.findFirst({
      where: { id, tenantId },
    });
    if (!record) this.helpers.throwNotFound('PerformanceReview');
    return record;
  }

  async list(tenantId: string): Promise<ListEntityDto[]> {
    const records = await this.prisma.performanceReview.findMany({
      where: tenantActiveWhere(tenantId),
      orderBy: { createdAt: 'desc' },
    });
    return records.map(mapPerformance);
  }

  async listTrashed(tenantId: string): Promise<ListEntityDto[]> {
    const records = await this.prisma.performanceReview.findMany({
      where: tenantTrashedWhere(tenantId),
      orderBy: { createdAt: 'desc' },
    });
    return records.map(mapPerformance);
  }

  async get(tenantId: string, id: string): Promise<ListEntityDto> {
    return mapPerformance(await this.findOrThrow(tenantId, id));
  }

  async create(
    tenantId: string,
    body: { name?: string; status?: string },
  ): Promise<ListEntityDto> {
    const employee = await this.prisma.employee.findFirst({
      where: { tenantId },
    });
    const record = await this.prisma.performanceReview.create({
      data: {
        tenantId,
        employeeId: employee?.id ?? '',
        period: body.name ?? '2025-Q1',
        status: body.status ?? 'draft',
      },
    });
    return mapPerformance(record);
  }

  async update(
    tenantId: string,
    id: string,
    body: { name?: string; status?: string },
  ): Promise<ListEntityDto> {
    await this.findOrThrow(tenantId, id);
    const updated = await this.prisma.performanceReview.update({
      where: { id },
      data: { period: body.name, status: body.status },
    });
    return mapPerformance(updated);
  }

  async submit(tenantId: string, id: string) {
    return this.update(tenantId, id, { status: 'submitted' });
  }

  async approve(tenantId: string, id: string) {
    return this.update(tenantId, id, { status: 'approved' });
  }

  async ratings(tenantId: string, employeeId: string) {
    const records = await this.prisma.performanceReview.findMany({
      where: { ...tenantActiveWhere(tenantId), employeeId },
    });
    return records.map(mapPerformance);
  }

  async softDelete(tenantId: string, id: string): Promise<ListEntityDto> {
    await this.findOrThrow(tenantId, id);
    const updated = await this.prisma.performanceReview.update({
      where: { id },
      data: softDeleteData(),
    });
    return mapPerformance(updated);
  }

  async restore(tenantId: string, id: string): Promise<ListEntityDto> {
    const record = await this.prisma.performanceReview.findFirst({
      where: { id, ...tenantTrashedWhere(tenantId) },
    });
    if (!record) this.helpers.throwNotFound('PerformanceReview');
    const updated = await this.prisma.performanceReview.update({
      where: { id },
      data: restoreData(),
    });
    return mapPerformance(updated);
  }

  async remove(tenantId: string, id: string) {
    await this.findOrThrow(tenantId, id);
    await this.prisma.performanceReview.delete({ where: { id } });
    return { id, deleted: true };
  }
}
