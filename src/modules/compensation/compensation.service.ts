import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { PaginatedResponseDto } from '../../common/dto/paginated-response.dto';
import { EntityNotFoundHelper } from '../../common/helpers/entity-not-found.helper';
import { paginate } from '../../common/helpers/pagination.helper';
import { mapCompensation, mapSalaryStructure } from '../../common/mappers/domain.mappers';
import { ListEntityDto } from '../../common/mappers/list-entity.mapper';
import {
  restoreData,
  softDeleteData,
  tenantActiveWhere,
  tenantTrashedWhere,
} from '../../common/services/soft-delete-crud.helper';

@Injectable()
export class CompensationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly helpers: EntityNotFoundHelper,
  ) {}

  private async findOrThrow(tenantId: string, id: string) {
    const record = await this.prisma.compensationRecord.findFirst({
      where: { id, tenantId },
    });
    if (!record) this.helpers.throwNotFound('Compensation');
    return record;
  }

  private async findStructureOrThrow(tenantId: string, id: string) {
    const record = await this.prisma.salaryStructure.findFirst({
      where: { id, tenantId },
    });
    if (!record) this.helpers.throwNotFound('SalaryStructure');
    return record;
  }

  async list(
    tenantId: string,
    query: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<ListEntityDto>> {
    return paginate(this.prisma.compensationRecord, {
      where: tenantActiveWhere(tenantId),
      orderBy: { createdAt: 'desc' },
      mapFn: mapCompensation,
      query,
    });
  }

  async listTrashed(
    tenantId: string,
    query: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<ListEntityDto>> {
    return paginate(this.prisma.compensationRecord, {
      where: tenantTrashedWhere(tenantId),
      orderBy: { createdAt: 'desc' },
      mapFn: mapCompensation,
      query,
    });
  }

  async get(tenantId: string, id: string): Promise<ListEntityDto> {
    return mapCompensation(await this.findOrThrow(tenantId, id));
  }

  async getByEmployee(tenantId: string, employeeId: string) {
    const record = await this.prisma.compensationRecord.findFirst({
      where: { ...tenantActiveWhere(tenantId), employeeId },
    });
    if (!record) this.helpers.throwNotFound('Compensation');
    return mapCompensation(record);
  }

  async byEmployee(tenantId: string, employeeId: string) {
    return this.getByEmployee(tenantId, employeeId);
  }

  async adjust(
    tenantId: string,
    employeeId: string,
    body: Record<string, unknown>,
  ) {
    const record = await this.prisma.compensationRecord.findFirst({
      where: { ...tenantActiveWhere(tenantId), employeeId },
    });
    if (!record) this.helpers.throwNotFound('Compensation');
    const amount = Number(body.amount ?? record.baseSalary);
    const updated = await this.prisma.compensationRecord.update({
      where: { id: record.id },
      data: { baseSalary: amount },
    });
    return mapCompensation(updated);
  }

  async createStructure(
    tenantId: string,
    body: { name?: string; status?: string },
  ): Promise<ListEntityDto> {
    const record = await this.prisma.salaryStructure.create({
      data: {
        tenantId,
        name: body.name ?? 'Structure',
        status: body.status ?? 'active',
      },
    });
    return mapSalaryStructure(record);
  }

  async salaryStructures(
    tenantId: string,
    query: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<ListEntityDto>> {
    return paginate(this.prisma.salaryStructure, {
      where: tenantActiveWhere(tenantId),
      mapFn: mapSalaryStructure,
      query,
    });
  }

  async listTrashedStructures(
    tenantId: string,
    query: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<ListEntityDto>> {
    return paginate(this.prisma.salaryStructure, {
      where: tenantTrashedWhere(tenantId),
      mapFn: mapSalaryStructure,
      query,
    });
  }

  async getStructure(tenantId: string, id: string): Promise<ListEntityDto> {
    return mapSalaryStructure(await this.findStructureOrThrow(tenantId, id));
  }

  async updateStructure(
    tenantId: string,
    id: string,
    body: { name?: string; status?: string },
  ): Promise<ListEntityDto> {
    await this.findStructureOrThrow(tenantId, id);
    const updated = await this.prisma.salaryStructure.update({
      where: { id },
      data: { name: body.name, status: body.status },
    });
    return mapSalaryStructure(updated);
  }

  async softDeleteStructure(
    tenantId: string,
    id: string,
  ): Promise<ListEntityDto> {
    await this.findStructureOrThrow(tenantId, id);
    const updated = await this.prisma.salaryStructure.update({
      where: { id },
      data: softDeleteData(),
    });
    return mapSalaryStructure(updated);
  }

  async restoreStructure(tenantId: string, id: string): Promise<ListEntityDto> {
    const record = await this.prisma.salaryStructure.findFirst({
      where: { id, ...tenantTrashedWhere(tenantId) },
    });
    if (!record) this.helpers.throwNotFound('SalaryStructure');
    const updated = await this.prisma.salaryStructure.update({
      where: { id },
      data: restoreData(),
    });
    return mapSalaryStructure(updated);
  }

  async removeStructure(tenantId: string, id: string) {
    await this.findStructureOrThrow(tenantId, id);
    await this.prisma.salaryStructure.delete({ where: { id } });
    return { id, deleted: true };
  }

  async create(
    tenantId: string,
    body: { name?: string; status?: string },
  ): Promise<ListEntityDto> {
    const employee = await this.prisma.employee.findFirst({
      where: { tenantId },
    });
    const record = await this.prisma.compensationRecord.create({
      data: {
        tenantId,
        employeeId: employee?.id ?? '',
        baseSalary: 75000,
        status: body.status ?? 'active',
      },
    });
    return mapCompensation(record);
  }

  async update(
    tenantId: string,
    employeeId: string,
    body: { status?: string },
  ): Promise<ListEntityDto> {
    const record = await this.prisma.compensationRecord.findFirst({
      where: { ...tenantActiveWhere(tenantId), employeeId },
    });
    if (!record) this.helpers.throwNotFound('Compensation');
    const updated = await this.prisma.compensationRecord.update({
      where: { id: record.id },
      data: { status: body.status },
    });
    return mapCompensation(updated);
  }

  async softDelete(tenantId: string, id: string): Promise<ListEntityDto> {
    await this.findOrThrow(tenantId, id);
    const updated = await this.prisma.compensationRecord.update({
      where: { id },
      data: softDeleteData(),
    });
    return mapCompensation(updated);
  }

  async restore(tenantId: string, id: string): Promise<ListEntityDto> {
    const record = await this.prisma.compensationRecord.findFirst({
      where: { id, ...tenantTrashedWhere(tenantId) },
    });
    if (!record) this.helpers.throwNotFound('Compensation');
    const updated = await this.prisma.compensationRecord.update({
      where: { id },
      data: restoreData(),
    });
    return mapCompensation(updated);
  }

  async remove(tenantId: string, employeeId: string) {
    const record = await this.prisma.compensationRecord.findFirst({
      where: { ...tenantActiveWhere(tenantId), employeeId },
    });
    if (!record) this.helpers.throwNotFound('Compensation');
    await this.prisma.compensationRecord.delete({ where: { id: record.id } });
    return { id: record.id, deleted: true };
  }

  async removeById(tenantId: string, id: string) {
    await this.findOrThrow(tenantId, id);
    await this.prisma.compensationRecord.delete({ where: { id } });
    return { id, deleted: true };
  }
}
