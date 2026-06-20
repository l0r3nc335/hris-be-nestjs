import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { PaginatedResponseDto } from '../../common/dto/paginated-response.dto';
import { EntityNotFoundHelper } from '../../common/helpers/entity-not-found.helper';
import { paginate } from '../../common/helpers/pagination.helper';
import { mapBenefitPlan } from '../../common/mappers/domain.mappers';
import { ListEntityDto } from '../../common/mappers/list-entity.mapper';
import {
  restoreData,
  softDeleteData,
  tenantActiveWhere,
  tenantTrashedWhere,
} from '../../common/services/soft-delete-crud.helper';

@Injectable()
export class BenefitsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly helpers: EntityNotFoundHelper,
  ) {}

  private async findOrThrow(tenantId: string, id: string) {
    const record = await this.prisma.benefitPlan.findFirst({
      where: { id, tenantId },
    });
    if (!record) this.helpers.throwNotFound('Benefit plan');
    return record;
  }

  async list(
    tenantId: string,
    query: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<ListEntityDto>> {
    return paginate(this.prisma.benefitPlan, {
      where: tenantActiveWhere(tenantId),
      orderBy: { createdAt: 'desc' },
      mapFn: mapBenefitPlan,
      query,
    });
  }

  async listTrashed(
    tenantId: string,
    query: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<ListEntityDto>> {
    return paginate(this.prisma.benefitPlan, {
      where: tenantTrashedWhere(tenantId),
      orderBy: { createdAt: 'desc' },
      mapFn: mapBenefitPlan,
      query,
    });
  }

  async get(tenantId: string, id: string): Promise<ListEntityDto> {
    return mapBenefitPlan(await this.findOrThrow(tenantId, id));
  }

  async create(
    tenantId: string,
    body: { name?: string; status?: string; planType?: string },
  ): Promise<ListEntityDto> {
    const record = await this.prisma.benefitPlan.create({
      data: {
        tenantId,
        name: body.name ?? 'Benefit plan',
        status: body.status ?? 'active',
        planType: body.planType ?? 'health',
      },
    });
    return mapBenefitPlan(record);
  }

  async update(
    tenantId: string,
    id: string,
    body: { name?: string; status?: string; planType?: string },
  ): Promise<ListEntityDto> {
    await this.findOrThrow(tenantId, id);
    const updated = await this.prisma.benefitPlan.update({
      where: { id },
      data: { name: body.name, status: body.status, planType: body.planType },
    });
    return mapBenefitPlan(updated);
  }

  async softDelete(tenantId: string, id: string): Promise<ListEntityDto> {
    await this.findOrThrow(tenantId, id);
    const updated = await this.prisma.benefitPlan.update({
      where: { id },
      data: softDeleteData(),
    });
    return mapBenefitPlan(updated);
  }

  async restore(tenantId: string, id: string): Promise<ListEntityDto> {
    const record = await this.prisma.benefitPlan.findFirst({
      where: { id, ...tenantTrashedWhere(tenantId) },
    });
    if (!record) this.helpers.throwNotFound('Benefit plan');
    const updated = await this.prisma.benefitPlan.update({
      where: { id },
      data: restoreData(),
    });
    return mapBenefitPlan(updated);
  }

  async remove(tenantId: string, id: string) {
    await this.findOrThrow(tenantId, id);
    await this.prisma.benefitPlan.delete({ where: { id } });
    return { id, deleted: true };
  }
}
