import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { PaginatedResponseDto } from '../../common/dto/paginated-response.dto';
import { EntityNotFoundHelper } from '../../common/helpers/entity-not-found.helper';
import { paginate } from '../../common/helpers/pagination.helper';
import { mapEmployeeDepartment } from '../../common/mappers/domain.mappers';
import { EmployeeDepartmentDto } from '../../common/mappers/list-entity.mapper';
import {
  restoreData,
  softDeleteData,
  tenantActiveWhere,
  tenantTrashedWhere,
} from '../../common/services/soft-delete-crud.helper';

const departmentInclude = { department: true } as const;

@Injectable()
export class EmployeeDepartmentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly helpers: EntityNotFoundHelper,
  ) {}

  private async findOrThrow(tenantId: string, id: string) {
    const record = await this.prisma.employee.findFirst({
      where: { id, tenantId },
      include: departmentInclude,
    });
    if (!record) this.helpers.throwNotFound('Employee department');
    return record;
  }

  async list(
    tenantId: string,
    query: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<EmployeeDepartmentDto>> {
    return paginate(this.prisma.employee, {
      where: tenantActiveWhere(tenantId),
      orderBy: { createdAt: 'desc' },
      mapFn: mapEmployeeDepartment,
      query,
      searchFields: ['firstName', 'lastName'],
      findManyExtras: { include: departmentInclude },
    });
  }

  async listTrashed(
    tenantId: string,
    query: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<EmployeeDepartmentDto>> {
    return paginate(this.prisma.employee, {
      where: tenantTrashedWhere(tenantId),
      orderBy: { createdAt: 'desc' },
      mapFn: mapEmployeeDepartment,
      query,
      searchFields: ['firstName', 'lastName'],
      findManyExtras: { include: departmentInclude },
    });
  }

  async get(tenantId: string, id: string): Promise<EmployeeDepartmentDto> {
    return mapEmployeeDepartment(await this.findOrThrow(tenantId, id));
  }

  async create(
    tenantId: string,
    body: { name?: string; status?: string; departmentId?: string },
  ): Promise<EmployeeDepartmentDto> {
    const { firstName, lastName } = this.helpers.parsePersonName(
      body.name ?? 'New Employee',
    );
    const record = await this.prisma.employee.create({
      data: {
        tenantId,
        firstName,
        lastName,
        status: body.status ?? 'active',
        departmentId: body.departmentId ?? null,
      },
      include: departmentInclude,
    });
    return mapEmployeeDepartment(record);
  }

  async update(
    tenantId: string,
    id: string,
    body: { name?: string; status?: string; departmentId?: string },
  ): Promise<EmployeeDepartmentDto> {
    await this.findOrThrow(tenantId, id);
    const data: {
      firstName?: string;
      lastName?: string;
      status?: string;
      departmentId?: string | null;
    } = {};
    if (body.name) {
      const parsed = this.helpers.parsePersonName(body.name);
      data.firstName = parsed.firstName;
      data.lastName = parsed.lastName;
    }
    if (body.status) data.status = body.status;
    if (body.departmentId !== undefined) {
      data.departmentId = body.departmentId || null;
    }
    const updated = await this.prisma.employee.update({
      where: { id },
      data,
      include: departmentInclude,
    });
    return mapEmployeeDepartment(updated);
  }

  async softDelete(tenantId: string, id: string): Promise<EmployeeDepartmentDto> {
    await this.findOrThrow(tenantId, id);
    const updated = await this.prisma.employee.update({
      where: { id },
      data: { ...softDeleteData(), status: 'inactive' },
      include: departmentInclude,
    });
    return mapEmployeeDepartment(updated);
  }

  async restore(tenantId: string, id: string): Promise<EmployeeDepartmentDto> {
    const record = await this.prisma.employee.findFirst({
      where: { id, ...tenantTrashedWhere(tenantId) },
      include: departmentInclude,
    });
    if (!record) this.helpers.throwNotFound('Employee department');
    const updated = await this.prisma.employee.update({
      where: { id },
      data: { ...restoreData(), status: 'active' },
      include: departmentInclude,
    });
    return mapEmployeeDepartment(updated);
  }

  async remove(tenantId: string, id: string) {
    await this.findOrThrow(tenantId, id);
    await this.prisma.employee.delete({ where: { id } });
    return { id, deleted: true };
  }
}
