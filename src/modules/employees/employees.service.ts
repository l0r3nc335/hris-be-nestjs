import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { EntityNotFoundHelper } from '../../common/helpers/entity-not-found.helper';
import { mapEmployee } from '../../common/mappers/domain.mappers';
import { ListEntityDto } from '../../common/mappers/list-entity.mapper';
import {
  restoreData,
  softDeleteData,
  tenantActiveWhere,
  tenantTrashedWhere,
} from '../../common/services/soft-delete-crud.helper';

@Injectable()
export class EmployeesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly helpers: EntityNotFoundHelper,
  ) {}

  private async findOrThrow(tenantId: string, id: string) {
    const record = await this.prisma.employee.findFirst({
      where: { id, tenantId },
    });
    if (!record) this.helpers.throwNotFound('Employee');
    return record;
  }

  async list(tenantId: string): Promise<ListEntityDto[]> {
    const records = await this.prisma.employee.findMany({
      where: tenantActiveWhere(tenantId),
      orderBy: { createdAt: 'desc' },
    });
    return records.map(mapEmployee);
  }

  async listTrashed(tenantId: string): Promise<ListEntityDto[]> {
    const records = await this.prisma.employee.findMany({
      where: tenantTrashedWhere(tenantId),
      orderBy: { createdAt: 'desc' },
    });
    return records.map(mapEmployee);
  }

  async get(tenantId: string, id: string): Promise<ListEntityDto> {
    return mapEmployee(await this.findOrThrow(tenantId, id));
  }

  async active(tenantId: string): Promise<ListEntityDto[]> {
    const records = await this.prisma.employee.findMany({
      where: { ...tenantActiveWhere(tenantId), status: 'active' },
      orderBy: { createdAt: 'desc' },
    });
    return records.map(mapEmployee);
  }

  async resigned(tenantId: string): Promise<ListEntityDto[]> {
    const records = await this.prisma.employee.findMany({
      where: {
        ...tenantActiveWhere(tenantId),
        status: { in: ['resigned', 'inactive'] },
      },
      orderBy: { createdAt: 'desc' },
    });
    return records.map(mapEmployee);
  }

  async byDepartment(
    tenantId: string,
    departmentId: string,
  ): Promise<ListEntityDto[]> {
    const records = await this.prisma.employee.findMany({
      where: { ...tenantActiveWhere(tenantId), departmentId },
      orderBy: { createdAt: 'desc' },
    });
    return records.map(mapEmployee);
  }

  async byManager(
    tenantId: string,
    managerId: string,
  ): Promise<ListEntityDto[]> {
    const records = await this.prisma.employee.findMany({
      where: { ...tenantActiveWhere(tenantId), managerId },
      orderBy: { createdAt: 'desc' },
    });
    return records.map(mapEmployee);
  }

  employmentHistory(tenantId: string, employeeId: string) {
    void tenantId;
    return [
      { employeeId, title: 'Current Role', from: '2024-01-01', to: null },
    ];
  }

  async promote(
    tenantId: string,
    id: string,
    body: Record<string, string>,
  ): Promise<ListEntityDto> {
    void body;
    return this.update(tenantId, id, { status: 'promoted' });
  }

  async transfer(
    tenantId: string,
    id: string,
    body: Record<string, string>,
  ): Promise<ListEntityDto> {
    const record = await this.findOrThrow(tenantId, id);
    const updated = await this.prisma.employee.update({
      where: { id: record.id },
      data: {
        status: 'transferred',
        departmentId: body.departmentId ?? record.departmentId,
      },
    });
    return mapEmployee(updated);
  }

  async create(
    tenantId: string,
    body: { name?: string; status?: string },
  ): Promise<ListEntityDto> {
    const { firstName, lastName } = this.helpers.parsePersonName(
      body.name ?? 'New Employee',
    );
    const record = await this.prisma.employee.create({
      data: {
        tenantId,
        firstName,
        lastName,
        status: body.status ?? 'active',
      },
    });
    return mapEmployee(record);
  }

  async update(
    tenantId: string,
    id: string,
    body: { name?: string; status?: string },
  ): Promise<ListEntityDto> {
    const record = await this.findOrThrow(tenantId, id);
    const data: { firstName?: string; lastName?: string; status?: string } = {};
    if (body.name) {
      const parsed = this.helpers.parsePersonName(body.name);
      data.firstName = parsed.firstName;
      data.lastName = parsed.lastName;
    }
    if (body.status) data.status = body.status;
    const updated = await this.prisma.employee.update({
      where: { id: record.id },
      data,
    });
    return mapEmployee(updated);
  }

  async softDelete(tenantId: string, id: string): Promise<ListEntityDto> {
    await this.findOrThrow(tenantId, id);
    const updated = await this.prisma.employee.update({
      where: { id },
      data: { ...softDeleteData(), status: 'inactive' },
    });
    return mapEmployee(updated);
  }

  async restore(tenantId: string, id: string): Promise<ListEntityDto> {
    const record = await this.prisma.employee.findFirst({
      where: { id, ...tenantTrashedWhere(tenantId) },
    });
    if (!record) this.helpers.throwNotFound('Employee');
    const updated = await this.prisma.employee.update({
      where: { id },
      data: { ...restoreData(), status: 'active' },
    });
    return mapEmployee(updated);
  }

  async deactivate(tenantId: string, id: string): Promise<ListEntityDto> {
    return this.softDelete(tenantId, id);
  }

  async remove(tenantId: string, id: string) {
    await this.findOrThrow(tenantId, id);
    await this.prisma.employee.delete({ where: { id } });
    return { id, deleted: true };
  }
}
