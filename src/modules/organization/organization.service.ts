import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { PaginatedResponseDto } from '../../common/dto/paginated-response.dto';
import { DepartmentsService } from '../departments/departments.service';
import { ListEntityDto } from '../../common/mappers/list-entity.mapper';
import { tenantActiveWhere } from '../../common/services/soft-delete-crud.helper';

export interface OrgChartNodeDto {
  id: string;
  name: string;
  title: string;
  children: OrgChartNodeDto[];
}

@Injectable()
export class OrganizationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly departments: DepartmentsService,
  ) {}

  async chart(tenantId: string): Promise<ListEntityDto[]> {
    return (
      await this.departments.list(tenantId, { page: 1, limit: 100 })
    ).data;
  }

  async listTrashed(
    tenantId: string,
    query: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<ListEntityDto>> {
    return this.departments.listTrashed(tenantId, query);
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

  async positionsTree(tenantId: string): Promise<OrgChartNodeDto[]> {
    const employees = await this.prisma.employee.findMany({
      where: tenantActiveWhere(tenantId),
      include: { position: true },
      orderBy: { firstName: 'asc' },
    });

    const nodes = new Map<string, OrgChartNodeDto>();
    for (const employee of employees) {
      nodes.set(employee.id, {
        id: employee.id,
        name: `${employee.firstName} ${employee.lastName}`,
        title: employee.position?.title ?? 'Employee',
        children: [],
      });
    }

    const roots: OrgChartNodeDto[] = [];
    for (const employee of employees) {
      const node = nodes.get(employee.id)!;
      if (employee.managerId && nodes.has(employee.managerId)) {
        nodes.get(employee.managerId)!.children.push(node);
      } else {
        roots.push(node);
      }
    }

    return roots;
  }
}
