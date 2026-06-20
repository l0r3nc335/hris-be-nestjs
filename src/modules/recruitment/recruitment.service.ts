import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { PaginatedResponseDto } from '../../common/dto/paginated-response.dto';
import { EntityNotFoundHelper } from '../../common/helpers/entity-not-found.helper';
import { paginate } from '../../common/helpers/pagination.helper';
import { mapApplicant, mapInterview, mapJobPosting } from '../../common/mappers/domain.mappers';
import { ListEntityDto } from '../../common/mappers/list-entity.mapper';
import {
  restoreData,
  softDeleteData,
  tenantActiveWhere,
  tenantTrashedWhere,
} from '../../common/services/soft-delete-crud.helper';

@Injectable()
export class RecruitmentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly helpers: EntityNotFoundHelper,
  ) {}

  private async findJobOrThrow(tenantId: string, id: string) {
    const record = await this.prisma.jobPosting.findFirst({
      where: { id, tenantId },
    });
    if (!record) this.helpers.throwNotFound('Job');
    return record;
  }

  private async findApplicantOrThrow(tenantId: string, id: string) {
    const record = await this.prisma.applicant.findFirst({
      where: { id, tenantId },
    });
    if (!record) this.helpers.throwNotFound('Applicant');
    return record;
  }

  async listJobs(
    tenantId: string,
    query: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<ListEntityDto>> {
    return paginate(this.prisma.jobPosting, {
      where: tenantActiveWhere(tenantId),
      orderBy: { createdAt: 'desc' },
      mapFn: mapJobPosting,
      query,
      searchFields: ['title'],
    });
  }

  async listTrashedJobs(
    tenantId: string,
    query: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<ListEntityDto>> {
    return paginate(this.prisma.jobPosting, {
      where: tenantTrashedWhere(tenantId),
      orderBy: { createdAt: 'desc' },
      mapFn: mapJobPosting,
      query,
      searchFields: ['title'],
    });
  }

  async getJob(tenantId: string, id: string): Promise<ListEntityDto> {
    return mapJobPosting(await this.findJobOrThrow(tenantId, id));
  }

  async createJob(
    tenantId: string,
    body: { name?: string; status?: string },
  ): Promise<ListEntityDto> {
    const record = await this.prisma.jobPosting.create({
      data: {
        tenantId,
        title: body.name ?? 'Job',
        status: body.status ?? 'open',
      },
    });
    return mapJobPosting(record);
  }

  async updateJob(
    tenantId: string,
    id: string,
    body: { name?: string; status?: string },
  ): Promise<ListEntityDto> {
    await this.findJobOrThrow(tenantId, id);
    const updated = await this.prisma.jobPosting.update({
      where: { id },
      data: { title: body.name, status: body.status },
    });
    return mapJobPosting(updated);
  }

  async softDeleteJob(tenantId: string, id: string): Promise<ListEntityDto> {
    await this.findJobOrThrow(tenantId, id);
    const updated = await this.prisma.jobPosting.update({
      where: { id },
      data: softDeleteData(),
    });
    return mapJobPosting(updated);
  }

  async restoreJob(tenantId: string, id: string): Promise<ListEntityDto> {
    const record = await this.prisma.jobPosting.findFirst({
      where: { id, ...tenantTrashedWhere(tenantId) },
    });
    if (!record) this.helpers.throwNotFound('Job');
    const updated = await this.prisma.jobPosting.update({
      where: { id },
      data: restoreData(),
    });
    return mapJobPosting(updated);
  }

  async removeJob(tenantId: string, id: string) {
    await this.findJobOrThrow(tenantId, id);
    await this.prisma.jobPosting.delete({ where: { id } });
    return { id, deleted: true };
  }

  async listApplicants(
    tenantId: string,
    query: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<ListEntityDto>> {
    return paginate(this.prisma.applicant, {
      where: tenantActiveWhere(tenantId),
      orderBy: { createdAt: 'desc' },
      mapFn: mapApplicant,
      query,
      searchFields: ['name'],
    });
  }

  async listTrashedApplicants(
    tenantId: string,
    query: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<ListEntityDto>> {
    return paginate(this.prisma.applicant, {
      where: tenantTrashedWhere(tenantId),
      orderBy: { createdAt: 'desc' },
      mapFn: mapApplicant,
      query,
      searchFields: ['name'],
    });
  }

  async getApplicant(tenantId: string, id: string): Promise<ListEntityDto> {
    return mapApplicant(await this.findApplicantOrThrow(tenantId, id));
  }

  async createApplicant(
    tenantId: string,
    body: { name?: string; jobId?: string; status?: string },
  ): Promise<ListEntityDto> {
    const job = await this.prisma.jobPosting.findFirst({ where: { tenantId } });
    const record = await this.prisma.applicant.create({
      data: {
        tenantId,
        jobId: body.jobId ?? job?.id ?? '',
        name: body.name ?? 'Applicant',
        status: body.status ?? 'applied',
      },
    });
    return mapApplicant(record);
  }

  async updateApplicant(
    tenantId: string,
    id: string,
    body: { name?: string; status?: string },
  ): Promise<ListEntityDto> {
    await this.findApplicantOrThrow(tenantId, id);
    const updated = await this.prisma.applicant.update({
      where: { id },
      data: { name: body.name, status: body.status },
    });
    return mapApplicant(updated);
  }

  async softDeleteApplicant(tenantId: string, id: string): Promise<ListEntityDto> {
    await this.findApplicantOrThrow(tenantId, id);
    const updated = await this.prisma.applicant.update({
      where: { id },
      data: softDeleteData(),
    });
    return mapApplicant(updated);
  }

  async restoreApplicant(tenantId: string, id: string): Promise<ListEntityDto> {
    const record = await this.prisma.applicant.findFirst({
      where: { id, ...tenantTrashedWhere(tenantId) },
    });
    if (!record) this.helpers.throwNotFound('Applicant');
    const updated = await this.prisma.applicant.update({
      where: { id },
      data: restoreData(),
    });
    return mapApplicant(updated);
  }

  async removeApplicant(tenantId: string, id: string) {
    await this.findApplicantOrThrow(tenantId, id);
    await this.prisma.applicant.delete({ where: { id } });
    return { id, deleted: true };
  }

  async hire(applicantId: string) {
    const updated = await this.prisma.applicant.update({
      where: { id: applicantId },
      data: { status: 'hired' },
    });
    return mapApplicant(updated);
  }

  async reject(applicantId: string) {
    const updated = await this.prisma.applicant.update({
      where: { id: applicantId },
      data: { status: 'rejected' },
    });
    return mapApplicant(updated);
  }

  async scheduleInterview(applicantId: string, body: Record<string, string>) {
    const applicant = await this.prisma.applicant.findUnique({
      where: { id: applicantId },
    });
    if (!applicant) this.helpers.throwNotFound('Applicant');
    const interview = await this.prisma.interview.create({
      data: {
        tenantId: applicant.tenantId,
        applicantId,
        scheduledAt: body.scheduledAt
          ? new Date(body.scheduledAt)
          : new Date(Date.now() + 86400000),
        status: 'scheduled',
      },
    });
    return { applicantId, interview: mapInterview(interview), status: 'scheduled' };
  }
}
