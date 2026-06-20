import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { PaginatedResponseDto } from '../../common/dto/paginated-response.dto';
import { paginate } from '../../common/helpers/pagination.helper';
import { mapTenant } from '../../common/mappers/domain.mappers';
import { ListEntityDto } from '../../common/mappers/list-entity.mapper';
import { EntityNotFoundHelper } from '../../common/helpers/entity-not-found.helper';
import {
  activeWhere,
  restoreData,
  softDeleteData,
  trashedWhere,
} from '../../common/services/soft-delete-crud.helper';

@Injectable()
export class TenantsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly helpers: EntityNotFoundHelper,
  ) {}

  private async findOrThrow(id: string) {
    const record = await this.prisma.tenant.findFirst({ where: { id } });
    if (!record) this.helpers.throwNotFound('Tenant');
    return record;
  }

  async list(query: PaginationQueryDto): Promise<PaginatedResponseDto<ListEntityDto>> {
    return paginate(this.prisma.tenant, {
      where: activeWhere,
      orderBy: { createdAt: 'desc' },
      mapFn: mapTenant,
      query,
      searchFields: ['name'],
    });
  }

  async listTrashed(query: PaginationQueryDto): Promise<PaginatedResponseDto<ListEntityDto>> {
    return paginate(this.prisma.tenant, {
      where: trashedWhere,
      orderBy: { createdAt: 'desc' },
      mapFn: mapTenant,
      query,
      searchFields: ['name'],
    });
  }

  async get(id: string): Promise<ListEntityDto> {
    const record = await this.prisma.tenant.findUnique({ where: { id } });
    if (!record) this.helpers.throwNotFound('Tenant');
    return mapTenant(record);
  }

  async create(body: { name: string; slug: string }) {
    const record = await this.prisma.tenant.create({
      data: { name: body.name, slug: body.slug, status: 'active' },
    });
    return mapTenant(record);
  }

  async update(id: string, body: { name?: string; status?: string }) {
    const record = await this.prisma.tenant.update({ where: { id }, data: body });
    return mapTenant(record);
  }

  async softDelete(id: string) {
    await this.findOrThrow(id);
    const record = await this.prisma.tenant.update({
      where: { id },
      data: softDeleteData(),
    });
    return mapTenant(record);
  }

  async restore(id: string) {
    const record = await this.prisma.tenant.findFirst({
      where: { id, ...trashedWhere },
    });
    if (!record) this.helpers.throwNotFound('Tenant');
    const updated = await this.prisma.tenant.update({
      where: { id },
      data: restoreData(),
    });
    return mapTenant(updated);
  }

  async suspend(id: string) {
    const record = await this.prisma.tenant.update({
      where: { id },
      data: { status: 'suspended' },
    });
    return mapTenant(record);
  }

  async reactivate(id: string) {
    const record = await this.prisma.tenant.update({
      where: { id },
      data: { status: 'active' },
    });
    return mapTenant(record);
  }

  async remove(id: string) {
    await this.findOrThrow(id);
    await this.prisma.tenant.delete({ where: { id } });
    return { id, deleted: true };
  }
}
