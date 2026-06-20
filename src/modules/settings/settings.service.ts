import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { PaginatedResponseDto } from '../../common/dto/paginated-response.dto';
import { EntityNotFoundHelper } from '../../common/helpers/entity-not-found.helper';
import { paginate } from '../../common/helpers/pagination.helper';
import {
  mapCompanySetting,
  mapLeaveType,
} from '../../common/mappers/domain.mappers';
import { ListEntityDto } from '../../common/mappers/list-entity.mapper';
import {
  restoreData,
  softDeleteData,
  tenantActiveWhere,
  tenantTrashedWhere,
} from '../../common/services/soft-delete-crud.helper';

@Injectable()
export class SettingsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly helpers: EntityNotFoundHelper,
  ) {}

  private async findSettingOrThrow(tenantId: string, id: string) {
    const record = await this.prisma.companySetting.findFirst({
      where: { id, tenantId },
    });
    if (!record) this.helpers.throwNotFound('Setting');
    return record;
  }

  private async findLeaveTypeOrThrow(tenantId: string, id: string) {
    const record = await this.prisma.leaveType.findFirst({
      where: { id, tenantId },
    });
    if (!record) this.helpers.throwNotFound('LeaveType');
    return record;
  }

  async list(
    tenantId: string,
    query: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<ListEntityDto>> {
    return paginate(this.prisma.companySetting, {
      where: tenantActiveWhere(tenantId),
      orderBy: { key: 'asc' },
      mapFn: mapCompanySetting,
      query,
      searchFields: ['key', 'value'],
    });
  }

  async listTrashed(
    tenantId: string,
    query: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<ListEntityDto>> {
    return paginate(this.prisma.companySetting, {
      where: tenantTrashedWhere(tenantId),
      orderBy: { key: 'asc' },
      mapFn: mapCompanySetting,
      query,
      searchFields: ['key', 'value'],
    });
  }

  async get(tenantId: string, id: string): Promise<ListEntityDto> {
    return mapCompanySetting(await this.findSettingOrThrow(tenantId, id));
  }

  async create(
    tenantId: string,
    body: { key?: string; value?: string; status?: string },
  ): Promise<ListEntityDto> {
    const record = await this.prisma.companySetting.create({
      data: {
        tenantId,
        key: body.key ?? 'setting',
        value: body.value ?? '',
        status: body.status ?? 'active',
      },
    });
    return mapCompanySetting(record);
  }

  async company(tenantId: string) {
    const setting = await this.prisma.companySetting.findUnique({
      where: { tenantId_key: { tenantId, key: 'companyName' } },
    });
    return { companyName: setting?.value ?? 'Acme HRIS' };
  }

  async updateCompany(tenantId: string, body: Record<string, string>) {
    const value = body.companyName ?? 'Acme HRIS';
    await this.prisma.companySetting.upsert({
      where: { tenantId_key: { tenantId, key: 'companyName' } },
      create: { tenantId, key: 'companyName', value, status: 'active' },
      update: { value },
    });
    return { companyName: value, ...body };
  }

  async leaveTypes(
    tenantId: string,
    query: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<ListEntityDto>> {
    return paginate(this.prisma.leaveType, {
      where: tenantActiveWhere(tenantId),
      mapFn: mapLeaveType,
      query,
    });
  }

  async listTrashedLeaveTypes(
    tenantId: string,
    query: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<ListEntityDto>> {
    return paginate(this.prisma.leaveType, {
      where: tenantTrashedWhere(tenantId),
      mapFn: mapLeaveType,
      query,
    });
  }

  async createLeaveType(
    tenantId: string,
    body: { name?: string; status?: string },
  ): Promise<ListEntityDto> {
    const record = await this.prisma.leaveType.create({
      data: {
        tenantId,
        name: body.name ?? 'LeaveType',
        status: body.status ?? 'active',
      },
    });
    return mapLeaveType(record);
  }

  async updateLeaveType(
    tenantId: string,
    id: string,
    body: { name?: string; status?: string },
  ): Promise<ListEntityDto> {
    await this.findLeaveTypeOrThrow(tenantId, id);
    const updated = await this.prisma.leaveType.update({
      where: { id },
      data: { name: body.name, status: body.status },
    });
    return mapLeaveType(updated);
  }

  async softDeleteLeaveType(
    tenantId: string,
    id: string,
  ): Promise<ListEntityDto> {
    await this.findLeaveTypeOrThrow(tenantId, id);
    const updated = await this.prisma.leaveType.update({
      where: { id },
      data: softDeleteData(),
    });
    return mapLeaveType(updated);
  }

  async restoreLeaveType(tenantId: string, id: string): Promise<ListEntityDto> {
    const record = await this.prisma.leaveType.findFirst({
      where: { id, ...tenantTrashedWhere(tenantId) },
    });
    if (!record) this.helpers.throwNotFound('LeaveType');
    const updated = await this.prisma.leaveType.update({
      where: { id },
      data: restoreData(),
    });
    return mapLeaveType(updated);
  }

  async removeLeaveType(tenantId: string, id: string) {
    await this.findLeaveTypeOrThrow(tenantId, id);
    await this.prisma.leaveType.delete({ where: { id } });
    return { id, deleted: true };
  }

  async update(tenantId: string, body: Record<string, string>) {
    for (const [key, value] of Object.entries(body)) {
      await this.prisma.companySetting.upsert({
        where: { tenantId_key: { tenantId, key } },
        create: { tenantId, key, value, status: 'active' },
        update: { value },
      });
    }
    return this.list(tenantId, {});
  }

  async softDelete(tenantId: string, id: string): Promise<ListEntityDto> {
    await this.findSettingOrThrow(tenantId, id);
    const updated = await this.prisma.companySetting.update({
      where: { id },
      data: softDeleteData(),
    });
    return mapCompanySetting(updated);
  }

  async restore(tenantId: string, id: string): Promise<ListEntityDto> {
    const record = await this.prisma.companySetting.findFirst({
      where: { id, ...tenantTrashedWhere(tenantId) },
    });
    if (!record) this.helpers.throwNotFound('Setting');
    const updated = await this.prisma.companySetting.update({
      where: { id },
      data: restoreData(),
    });
    return mapCompanySetting(updated);
  }

  async remove(tenantId: string, id: string) {
    await this.findSettingOrThrow(tenantId, id);
    await this.prisma.companySetting.delete({ where: { id } });
    return { id, deleted: true };
  }
}
