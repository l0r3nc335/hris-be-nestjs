import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { EntityNotFoundHelper } from '../../common/helpers/entity-not-found.helper';
import { mapDepartment } from '../../common/mappers/domain.mappers';
import { ListEntityDto } from '../../common/mappers/list-entity.mapper';
import {
  restoreData,
  softDeleteData,
  tenantActiveWhere,
  tenantTrashedWhere,
} from '../../common/services/soft-delete-crud.helper';

@Injectable()
export class DepartmentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly helpers: EntityNotFoundHelper,
  ) {}

  private async findOrThrow(tenantId: string, id: string) {
    const record = await this.prisma.department.findFirst({
      where: { id, tenantId },
    });
    if (!record) this.helpers.throwNotFound('Department');
    return record;
  }

  async list(tenantId: string): Promise<ListEntityDto[]> {
    const records = await this.prisma.department.findMany({
      where: tenantActiveWhere(tenantId),
      orderBy: { createdAt: 'desc' },
    });
    return records.map(mapDepartment);
  }

  async listTrashed(tenantId: string): Promise<ListEntityDto[]> {
    const records = await this.prisma.department.findMany({
      where: tenantTrashedWhere(tenantId),
      orderBy: { createdAt: 'desc' },
    });
    return records.map(mapDepartment);
  }

  async get(tenantId: string, id: string): Promise<ListEntityDto> {
    return mapDepartment(await this.findOrThrow(tenantId, id));
  }

  async employees(tenantId: string, departmentId: string) {
    const records = await this.prisma.employee.findMany({
      where: { tenantId, departmentId },
    });
    return records;
  }

  async create(
    tenantId: string,
    body: { name?: string; status?: string },
  ): Promise<ListEntityDto> {
    const record = await this.prisma.department.create({
      data: {
        tenantId,
        name: body.name ?? 'Department',
        status: body.status ?? 'active',
      },
    });
    return mapDepartment(record);
  }

  async update(
    tenantId: string,
    id: string,
    body: { name?: string; status?: string },
  ): Promise<ListEntityDto> {
    await this.findOrThrow(tenantId, id);
    const updated = await this.prisma.department.update({
      where: { id },
      data: {
        name: body.name,
        status: body.status,
      },
    });
    return mapDepartment(updated);
  }

  async softDelete(tenantId: string, id: string): Promise<ListEntityDto> {
    await this.findOrThrow(tenantId, id);
    const updated = await this.prisma.department.update({
      where: { id },
      data: softDeleteData(),
    });
    return mapDepartment(updated);
  }

  async restore(tenantId: string, id: string): Promise<ListEntityDto> {
    const record = await this.prisma.department.findFirst({
      where: { id, ...tenantTrashedWhere(tenantId) },
    });
    if (!record) this.helpers.throwNotFound('Department');
    const updated = await this.prisma.department.update({
      where: { id },
      data: restoreData(),
    });
    return mapDepartment(updated);
  }

  async remove(tenantId: string, id: string) {
    await this.findOrThrow(tenantId, id);
    await this.prisma.department.delete({ where: { id } });
    return { id, deleted: true };
  }
}
