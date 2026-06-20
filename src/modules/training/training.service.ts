import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { PaginatedResponseDto } from '../../common/dto/paginated-response.dto';
import { EntityNotFoundHelper } from '../../common/helpers/entity-not-found.helper';
import { paginate } from '../../common/helpers/pagination.helper';
import { mapTrainingCourse } from '../../common/mappers/domain.mappers';
import { ListEntityDto } from '../../common/mappers/list-entity.mapper';
import {
  restoreData,
  softDeleteData,
  tenantActiveWhere,
  tenantTrashedWhere,
} from '../../common/services/soft-delete-crud.helper';

@Injectable()
export class TrainingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly helpers: EntityNotFoundHelper,
  ) {}

  private async findOrThrow(tenantId: string, id: string) {
    const record = await this.prisma.trainingCourse.findFirst({
      where: { id, tenantId },
    });
    if (!record) this.helpers.throwNotFound('Training course');
    return record;
  }

  async list(
    tenantId: string,
    query: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<ListEntityDto>> {
    return paginate(this.prisma.trainingCourse, {
      where: tenantActiveWhere(tenantId),
      orderBy: { createdAt: 'desc' },
      mapFn: mapTrainingCourse,
      query,
    });
  }

  async listTrashed(
    tenantId: string,
    query: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<ListEntityDto>> {
    return paginate(this.prisma.trainingCourse, {
      where: tenantTrashedWhere(tenantId),
      orderBy: { createdAt: 'desc' },
      mapFn: mapTrainingCourse,
      query,
    });
  }

  async get(tenantId: string, id: string): Promise<ListEntityDto> {
    return mapTrainingCourse(await this.findOrThrow(tenantId, id));
  }

  async create(
    tenantId: string,
    body: { name?: string; status?: string; category?: string },
  ): Promise<ListEntityDto> {
    const record = await this.prisma.trainingCourse.create({
      data: {
        tenantId,
        name: body.name ?? 'Training course',
        status: body.status ?? 'active',
        category: body.category,
      },
    });
    return mapTrainingCourse(record);
  }

  async update(
    tenantId: string,
    id: string,
    body: { name?: string; status?: string; category?: string },
  ): Promise<ListEntityDto> {
    await this.findOrThrow(tenantId, id);
    const updated = await this.prisma.trainingCourse.update({
      where: { id },
      data: { name: body.name, status: body.status, category: body.category },
    });
    return mapTrainingCourse(updated);
  }

  async softDelete(tenantId: string, id: string): Promise<ListEntityDto> {
    await this.findOrThrow(tenantId, id);
    const updated = await this.prisma.trainingCourse.update({
      where: { id },
      data: softDeleteData(),
    });
    return mapTrainingCourse(updated);
  }

  async restore(tenantId: string, id: string): Promise<ListEntityDto> {
    const record = await this.prisma.trainingCourse.findFirst({
      where: { id, ...tenantTrashedWhere(tenantId) },
    });
    if (!record) this.helpers.throwNotFound('Training course');
    const updated = await this.prisma.trainingCourse.update({
      where: { id },
      data: restoreData(),
    });
    return mapTrainingCourse(updated);
  }

  async remove(tenantId: string, id: string) {
    await this.findOrThrow(tenantId, id);
    await this.prisma.trainingCourse.delete({ where: { id } });
    return { id, deleted: true };
  }
}
