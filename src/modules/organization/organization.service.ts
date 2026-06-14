import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { DepartmentsService } from '../departments/departments.service';
import {
  mapPosition,
} from '../../common/mappers/domain.mappers';
import { ListEntityDto } from '../../common/mappers/list-entity.mapper';
import { tenantActiveWhere } from '../../common/services/soft-delete-crud.helper';

@Injectable()
export class OrganizationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly departments: DepartmentsService,
  ) {}

  async chart(tenantId: string): Promise<ListEntityDto[]> {
    return this.departments.list(tenantId);
  }

  async listTrashed(tenantId: string): Promise<ListEntityDto[]> {
    return this.departments.listTrashed(tenantId);
  }

  async getChartNode(tenantId: string, id: string): Promise<ListEntityDto> {
    return this.departments.get(tenantId, id);
  }

  async create(
    tenantId: string,
    body: { name?: string; status?: string },
  ): Promise<ListEntityDto> {
    return this.departments.create(tenantId, body);
  }

  async update(
    tenantId: string,
    id: string,
    body: { name?: string; status?: string },
  ): Promise<ListEntityDto> {
    return this.departments.update(tenantId, id, body);
  }

  async softDelete(tenantId: string, id: string): Promise<ListEntityDto> {
    return this.departments.softDelete(tenantId, id);
  }

  async restore(tenantId: string, id: string): Promise<ListEntityDto> {
    return this.departments.restore(tenantId, id);
  }

  async remove(tenantId: string, id: string) {
    return this.departments.remove(tenantId, id);
  }

  async reportingLines(tenantId: string) {
    const employees = await this.prisma.employee.findMany({
      where: { ...tenantActiveWhere(tenantId), managerId: { not: null } },
      select: { id: true, managerId: true, firstName: true, lastName: true },
    });
    return employees.map((e) => ({
      employeeId: e.id,
      managerId: e.managerId,
      name: `${e.firstName} ${e.lastName}`,
    }));
  }

  async positionsTree(tenantId: string): Promise<ListEntityDto[]> {
    const records = await this.prisma.position.findMany({
      where: tenantActiveWhere(tenantId),
      orderBy: { title: 'asc' },
    });
    return records.map(mapPosition);
  }
}
