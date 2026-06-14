import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { EntityNotFoundHelper } from '../../common/helpers/entity-not-found.helper';
import { mapInterview } from '../../common/mappers/domain.mappers';
import { ListEntityDto } from '../../common/mappers/list-entity.mapper';
import {
  restoreData,
  softDeleteData,
  tenantActiveWhere,
  tenantTrashedWhere,
} from '../../common/services/soft-delete-crud.helper';

@Injectable()
export class InterviewsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly helpers: EntityNotFoundHelper,
  ) {}

  private async findOrThrow(tenantId: string, id: string) {
    const record = await this.prisma.interview.findFirst({
      where: { id, tenantId },
    });
    if (!record) this.helpers.throwNotFound('Interview');
    return record;
  }

  async list(tenantId: string): Promise<ListEntityDto[]> {
    const records = await this.prisma.interview.findMany({
      where: tenantActiveWhere(tenantId),
      orderBy: { createdAt: 'desc' },
    });
    return records.map(mapInterview);
  }

  async listTrashed(tenantId: string): Promise<ListEntityDto[]> {
    const records = await this.prisma.interview.findMany({
      where: tenantTrashedWhere(tenantId),
      orderBy: { createdAt: 'desc' },
    });
    return records.map(mapInterview);
  }

  async get(tenantId: string, id: string): Promise<ListEntityDto> {
    return mapInterview(await this.findOrThrow(tenantId, id));
  }

  async create(
    tenantId: string,
    body: { name?: string; status?: string; applicantId?: string },
  ): Promise<ListEntityDto> {
    const applicant = await this.prisma.applicant.findFirst({
      where: { tenantId },
    });
    const record = await this.prisma.interview.create({
      data: {
        tenantId,
        applicantId: body.applicantId ?? applicant?.id ?? '',
        scheduledAt: new Date(Date.now() + 86400000),
        status: body.status ?? 'scheduled',
      },
    });
    return mapInterview(record);
  }

  async update(
    tenantId: string,
    id: string,
    body: { name?: string; status?: string },
  ): Promise<ListEntityDto> {
    await this.findOrThrow(tenantId, id);
    const updated = await this.prisma.interview.update({
      where: { id },
      data: { status: body.status },
    });
    return mapInterview(updated);
  }

  async reschedule(tenantId: string, id: string, body: { scheduledAt?: string }) {
    await this.findOrThrow(tenantId, id);
    const updated = await this.prisma.interview.update({
      where: { id },
      data: {
        scheduledAt: body.scheduledAt
          ? new Date(body.scheduledAt)
          : new Date(Date.now() + 86400000),
        status: 'rescheduled',
      },
    });
    return mapInterview(updated);
  }

  async complete(tenantId: string, id: string) {
    return this.update(tenantId, id, { status: 'completed' });
  }

  async softDelete(tenantId: string, id: string): Promise<ListEntityDto> {
    await this.findOrThrow(tenantId, id);
    const updated = await this.prisma.interview.update({
      where: { id },
      data: softDeleteData(),
    });
    return mapInterview(updated);
  }

  async restore(tenantId: string, id: string): Promise<ListEntityDto> {
    const record = await this.prisma.interview.findFirst({
      where: { id, ...tenantTrashedWhere(tenantId) },
    });
    if (!record) this.helpers.throwNotFound('Interview');
    const updated = await this.prisma.interview.update({
      where: { id },
      data: restoreData(),
    });
    return mapInterview(updated);
  }

  async remove(tenantId: string, id: string) {
    await this.findOrThrow(tenantId, id);
    await this.prisma.interview.delete({ where: { id } });
    return { id, deleted: true };
  }
}
