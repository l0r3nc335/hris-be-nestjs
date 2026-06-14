import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { EntityNotFoundHelper } from '../../common/helpers/entity-not-found.helper';
import { mapPayroll } from '../../common/mappers/domain.mappers';
import { ListEntityDto } from '../../common/mappers/list-entity.mapper';
import {
  restoreData,
  softDeleteData,
  tenantActiveWhere,
  tenantTrashedWhere,
} from '../../common/services/soft-delete-crud.helper';

@Injectable()
export class PayrollService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly helpers: EntityNotFoundHelper,
  ) {}

  private async findOrThrow(tenantId: string, id: string) {
    const record = await this.prisma.payrollRecord.findFirst({
      where: { id, tenantId },
    });
    if (!record) this.helpers.throwNotFound('Payroll');
    return record;
  }

  async list(tenantId: string): Promise<ListEntityDto[]> {
    const records = await this.prisma.payrollRecord.findMany({
      where: tenantActiveWhere(tenantId),
      orderBy: { createdAt: 'desc' },
    });
    return records.map(mapPayroll);
  }

  async listTrashed(tenantId: string): Promise<ListEntityDto[]> {
    const records = await this.prisma.payrollRecord.findMany({
      where: tenantTrashedWhere(tenantId),
      orderBy: { createdAt: 'desc' },
    });
    return records.map(mapPayroll);
  }

  async get(tenantId: string, id: string): Promise<ListEntityDto> {
    return mapPayroll(await this.findOrThrow(tenantId, id));
  }

  async create(
    tenantId: string,
    body: { name?: string; status?: string },
  ): Promise<ListEntityDto> {
    const employee = await this.prisma.employee.findFirst({
      where: { tenantId },
    });
    const record = await this.prisma.payrollRecord.create({
      data: {
        tenantId,
        employeeId: employee?.id ?? '',
        period: body.name ?? `2025-${Date.now()}`,
        status: body.status ?? 'pending',
        amount: 50000,
      },
    });
    return mapPayroll(record);
  }

  async update(
    tenantId: string,
    id: string,
    body: { name?: string; status?: string },
  ): Promise<ListEntityDto> {
    await this.findOrThrow(tenantId, id);
    const updated = await this.prisma.payrollRecord.update({
      where: { id },
      data: {
        period: body.name,
        status: body.status,
      },
    });
    return mapPayroll(updated);
  }

  async softDelete(tenantId: string, id: string): Promise<ListEntityDto> {
    await this.findOrThrow(tenantId, id);
    const updated = await this.prisma.payrollRecord.update({
      where: { id },
      data: softDeleteData(),
    });
    return mapPayroll(updated);
  }

  async restore(tenantId: string, id: string): Promise<ListEntityDto> {
    const record = await this.prisma.payrollRecord.findFirst({
      where: { id, ...tenantTrashedWhere(tenantId) },
    });
    if (!record) this.helpers.throwNotFound('Payroll');
    const updated = await this.prisma.payrollRecord.update({
      where: { id },
      data: restoreData(),
    });
    return mapPayroll(updated);
  }

  async remove(tenantId: string, id: string) {
    await this.findOrThrow(tenantId, id);
    await this.prisma.payrollRecord.delete({ where: { id } });
    return { id, deleted: true };
  }

  async generate(tenantId: string, body?: Record<string, unknown>) {
    void body;
    return { status: 'queued', tenantId };
  }

  async run(tenantId: string, body?: Record<string, unknown>) {
    void body;
    return { status: 'running', tenantId };
  }

  async summary(tenantId: string) {
    const records = await this.prisma.payrollRecord.findMany({
      where: tenantActiveWhere(tenantId),
    });
    const total = records.reduce((sum, r) => sum + Number(r.amount), 0);
    return { total, count: records.length };
  }

  async history(tenantId: string) {
    return this.list(tenantId);
  }

  async slips(tenantId: string, employeeId: string) {
    const records = await this.prisma.payrollRecord.findMany({
      where: { ...tenantActiveWhere(tenantId), employeeId },
    });
    return records.map(mapPayroll);
  }
}
