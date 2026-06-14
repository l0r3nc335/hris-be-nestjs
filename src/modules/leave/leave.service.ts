import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { EntityNotFoundHelper } from '../../common/helpers/entity-not-found.helper';
import { mapLeaveRequest, mapLeaveType } from '../../common/mappers/domain.mappers';
import { ListEntityDto } from '../../common/mappers/list-entity.mapper';
import {
  restoreData,
  softDeleteData,
  tenantActiveWhere,
  tenantTrashedWhere,
} from '../../common/services/soft-delete-crud.helper';

@Injectable()
export class LeaveService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly helpers: EntityNotFoundHelper,
  ) {}

  private async findOrThrow(tenantId: string, id: string) {
    const record = await this.prisma.leaveRequest.findFirst({
      where: { id, tenantId },
      include: { leaveType: true },
    });
    if (!record) this.helpers.throwNotFound('Leave');
    return record;
  }

  async list(tenantId: string): Promise<ListEntityDto[]> {
    const records = await this.prisma.leaveRequest.findMany({
      where: tenantActiveWhere(tenantId),
      include: { leaveType: true },
      orderBy: { createdAt: 'desc' },
    });
    return records.map(mapLeaveRequest);
  }

  async listTrashed(tenantId: string): Promise<ListEntityDto[]> {
    const records = await this.prisma.leaveRequest.findMany({
      where: tenantTrashedWhere(tenantId),
      include: { leaveType: true },
      orderBy: { createdAt: 'desc' },
    });
    return records.map(mapLeaveRequest);
  }

  async get(tenantId: string, id: string): Promise<ListEntityDto> {
    return mapLeaveRequest(await this.findOrThrow(tenantId, id));
  }

  async pending(tenantId: string): Promise<ListEntityDto[]> {
    const records = await this.prisma.leaveRequest.findMany({
      where: { ...tenantActiveWhere(tenantId), status: 'pending' },
      include: { leaveType: true },
    });
    return records.map(mapLeaveRequest);
  }

  async apply(tenantId: string, body: Record<string, string>) {
    return this.create(tenantId, body);
  }

  async approve(tenantId: string, id: string) {
    return this.update(tenantId, id, { status: 'approved' });
  }

  async reject(tenantId: string, id: string) {
    return this.update(tenantId, id, { status: 'rejected' });
  }

  async cancel(tenantId: string, id: string) {
    return this.update(tenantId, id, { status: 'cancelled' });
  }

  async create(
    tenantId: string,
    body: { name?: string; status?: string; employeeId?: string },
  ): Promise<ListEntityDto> {
    const employee = await this.prisma.employee.findFirst({
      where: { tenantId },
    });
    const leaveType = await this.prisma.leaveType.findFirst({
      where: { tenantId },
    });
    const record = await this.prisma.leaveRequest.create({
      data: {
        tenantId,
        employeeId: body.employeeId ?? employee?.id ?? '',
        leaveTypeId: leaveType?.id ?? '',
        status: body.status ?? 'pending',
        startDate: new Date(),
        endDate: new Date(Date.now() + 86400000),
      },
      include: { leaveType: true },
    });
    return mapLeaveRequest(record);
  }

  async update(
    tenantId: string,
    id: string,
    body: { name?: string; status?: string },
  ): Promise<ListEntityDto> {
    await this.findOrThrow(tenantId, id);
    const updated = await this.prisma.leaveRequest.update({
      where: { id },
      data: { status: body.status },
      include: { leaveType: true },
    });
    return mapLeaveRequest(updated);
  }

  async balance(tenantId: string, employeeId: string) {
    void tenantId;
    const count = await this.prisma.leaveRequest.count({
      where: { employeeId, status: 'approved' },
    });
    return { employeeId, balance: Math.max(0, 20 - count * 2) };
  }

  async history(tenantId: string, employeeId: string) {
    const records = await this.prisma.leaveRequest.findMany({
      where: { ...tenantActiveWhere(tenantId), employeeId },
      include: { leaveType: true },
      orderBy: { createdAt: 'desc' },
    });
    return records.map(mapLeaveRequest);
  }

  async softDelete(tenantId: string, id: string): Promise<ListEntityDto> {
    await this.findOrThrow(tenantId, id);
    const updated = await this.prisma.leaveRequest.update({
      where: { id },
      data: softDeleteData(),
      include: { leaveType: true },
    });
    return mapLeaveRequest(updated);
  }

  async restore(tenantId: string, id: string): Promise<ListEntityDto> {
    const record = await this.prisma.leaveRequest.findFirst({
      where: { id, ...tenantTrashedWhere(tenantId) },
      include: { leaveType: true },
    });
    if (!record) this.helpers.throwNotFound('Leave');
    const updated = await this.prisma.leaveRequest.update({
      where: { id },
      data: restoreData(),
      include: { leaveType: true },
    });
    return mapLeaveRequest(updated);
  }

  async remove(tenantId: string, id: string) {
    await this.findOrThrow(tenantId, id);
    await this.prisma.leaveRequest.delete({ where: { id } });
    return { id, deleted: true };
  }

  async listLeaveTypes(tenantId: string): Promise<ListEntityDto[]> {
    const records = await this.prisma.leaveType.findMany({
      where: tenantActiveWhere(tenantId),
    });
    return records.map(mapLeaveType);
  }
}
