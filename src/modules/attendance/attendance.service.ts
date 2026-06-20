import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { PaginatedResponseDto } from '../../common/dto/paginated-response.dto';
import { EntityNotFoundHelper } from '../../common/helpers/entity-not-found.helper';
import { paginate } from '../../common/helpers/pagination.helper';
import { mapAttendance } from '../../common/mappers/domain.mappers';
import { ListEntityDto } from '../../common/mappers/list-entity.mapper';
import {
  restoreData,
  softDeleteData,
  tenantActiveWhere,
  tenantTrashedWhere,
} from '../../common/services/soft-delete-crud.helper';

@Injectable()
export class AttendanceService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly helpers: EntityNotFoundHelper,
  ) {}

  private async findOrThrow(tenantId: string, id: string) {
    const record = await this.prisma.attendanceRecord.findFirst({
      where: { id, tenantId },
    });
    if (!record) this.helpers.throwNotFound('Attendance');
    return record;
  }

  async list(
    tenantId: string,
    query: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<ListEntityDto>> {
    return paginate(this.prisma.attendanceRecord, {
      where: tenantActiveWhere(tenantId),
      orderBy: { createdAt: 'desc' },
      mapFn: mapAttendance,
      query,
    });
  }

  async listTrashed(
    tenantId: string,
    query: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<ListEntityDto>> {
    return paginate(this.prisma.attendanceRecord, {
      where: tenantTrashedWhere(tenantId),
      orderBy: { createdAt: 'desc' },
      mapFn: mapAttendance,
      query,
    });
  }

  async get(tenantId: string, id: string): Promise<ListEntityDto> {
    return mapAttendance(await this.findOrThrow(tenantId, id));
  }

  async getByEmployee(tenantId: string, employeeId: string) {
    const records = await this.prisma.attendanceRecord.findMany({
      where: { ...tenantActiveWhere(tenantId), employeeId },
      orderBy: { date: 'desc' },
    });
    return records.map(mapAttendance);
  }

  async today(tenantId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const records = await this.prisma.attendanceRecord.findMany({
      where: { ...tenantActiveWhere(tenantId), date: today },
    });
    return records.map(mapAttendance);
  }

  async byEmployee(tenantId: string, employeeId: string) {
    return this.getByEmployee(tenantId, employeeId);
  }

  async range(tenantId: string, start?: string, end?: string) {
    const records = await this.prisma.attendanceRecord.findMany({
      where: {
        ...tenantActiveWhere(tenantId),
        ...(start && end
          ? { date: { gte: new Date(start), lte: new Date(end) } }
          : {}),
      },
      orderBy: { date: 'desc' },
    });
    return records.map(mapAttendance);
  }

  async summary(tenantId: string, employeeId: string) {
    const count = await this.prisma.attendanceRecord.count({
      where: { ...tenantActiveWhere(tenantId), employeeId, status: 'present' },
    });
    return { employeeId, presentDays: count };
  }

  async checkIn(tenantId: string, body: Record<string, string>) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const record = await this.prisma.attendanceRecord.create({
      data: {
        tenantId,
        employeeId: body.employeeId ?? '',
        date: today,
        status: 'present',
      },
    });
    return mapAttendance(record);
  }

  async checkOut(tenantId: string, body: Record<string, string>) {
    void tenantId;
    void body;
    return { status: 'checked-out' };
  }

  async create(
    tenantId: string,
    body: { name?: string; status?: string; employeeId?: string },
  ): Promise<ListEntityDto> {
    const employee = await this.prisma.employee.findFirst({
      where: { tenantId },
    });
    const record = await this.prisma.attendanceRecord.create({
      data: {
        tenantId,
        employeeId: body.employeeId ?? employee?.id ?? '',
        date: new Date(),
        status: body.status ?? 'present',
      },
    });
    return mapAttendance(record);
  }

  async update(
    tenantId: string,
    id: string,
    body: { name?: string; status?: string },
  ): Promise<ListEntityDto> {
    await this.findOrThrow(tenantId, id);
    const updated = await this.prisma.attendanceRecord.update({
      where: { id },
      data: { status: body.status },
    });
    return mapAttendance(updated);
  }

  async softDelete(tenantId: string, id: string): Promise<ListEntityDto> {
    await this.findOrThrow(tenantId, id);
    const updated = await this.prisma.attendanceRecord.update({
      where: { id },
      data: softDeleteData(),
    });
    return mapAttendance(updated);
  }

  async restore(tenantId: string, id: string): Promise<ListEntityDto> {
    const record = await this.prisma.attendanceRecord.findFirst({
      where: { id, ...tenantTrashedWhere(tenantId) },
    });
    if (!record) this.helpers.throwNotFound('Attendance');
    const updated = await this.prisma.attendanceRecord.update({
      where: { id },
      data: restoreData(),
    });
    return mapAttendance(updated);
  }

  async remove(tenantId: string, id: string) {
    await this.findOrThrow(tenantId, id);
    await this.prisma.attendanceRecord.delete({ where: { id } });
    return { id, deleted: true };
  }
}
