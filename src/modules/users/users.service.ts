import { Injectable, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { AuthService } from '../auth/auth.service';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { PaginatedResponseDto } from '../../common/dto/paginated-response.dto';
import { EntityNotFoundHelper } from '../../common/helpers/entity-not-found.helper';
import { paginate } from '../../common/helpers/pagination.helper';
import { mapUser } from '../../common/mappers/domain.mappers';
import { ListEntityDto } from '../../common/mappers/list-entity.mapper';
import { AppException, ErrorCodes } from '../../common/errors/app.exception';
import { RequestUser } from '../../common/types/request-user';
import {
  restoreData,
  softDeleteData,
  tenantActiveWhere,
  tenantTrashedWhere,
} from '../../common/services/soft-delete-crud.helper';

function buildUserStatusFilter(status?: string): Record<string, unknown> {
  if (!status || status === 'all') return {};
  if (status === 'active') return { isActive: true };
  if (status === 'inactive') return { isActive: false };
  return {};
}

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auth: AuthService,
    private readonly helpers: EntityNotFoundHelper,
  ) {}

  private async findOrThrow(tenantId: string, id: string) {
    const record = await this.prisma.user.findFirst({
      where: { id, tenantId },
    });
    if (!record) this.helpers.throwNotFound('User');
    return record;
  }

  async list(
    tenantId: string,
    query: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<ListEntityDto>> {
    return paginate(this.prisma.user, {
      where: tenantActiveWhere(tenantId),
      orderBy: { createdAt: 'desc' },
      mapFn: mapUser,
      query,
      searchFields: ['firstName', 'lastName', 'email'],
      resolveStatusFilter: buildUserStatusFilter,
    });
  }

  async listTrashed(
    tenantId: string,
    query: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<ListEntityDto>> {
    return paginate(this.prisma.user, {
      where: tenantTrashedWhere(tenantId),
      orderBy: { createdAt: 'desc' },
      mapFn: mapUser,
      query,
      searchFields: ['firstName', 'lastName', 'email'],
      resolveStatusFilter: buildUserStatusFilter,
    });
  }

  async get(tenantId: string, id: string): Promise<ListEntityDto> {
    return mapUser(await this.findOrThrow(tenantId, id));
  }

  async getProfile(tenantId: string, userId: string) {
    const user = await this.findOrThrow(tenantId, userId);
    return this.auth.me({
      id: user.id,
      tenantId: user.tenantId,
      email: user.email,
      role: user.role,
      permissions: [],
      isActive: user.isActive,
    });
  }

  async search(tenantId: string, q?: string): Promise<ListEntityDto[]> {
    const result = await this.list(tenantId, { q, page: 1, limit: 100 });
    return result.data;
  }

  async active(tenantId: string): Promise<ListEntityDto[]> {
    const records = await this.prisma.user.findMany({
      where: { ...tenantActiveWhere(tenantId), isActive: true },
      orderBy: { createdAt: 'desc' },
    });
    return records.map(mapUser);
  }

  async inactive(tenantId: string): Promise<ListEntityDto[]> {
    const records = await this.prisma.user.findMany({
      where: { ...tenantActiveWhere(tenantId), isActive: false },
      orderBy: { createdAt: 'desc' },
    });
    return records.map(mapUser);
  }

  async create(
    tenantId: string,
    body: {
      name?: string;
      firstName?: string;
      lastName?: string;
      email?: string;
      status?: string;
    },
  ): Promise<ListEntityDto> {
    const { firstName, lastName } =
      body.firstName !== undefined || body.lastName !== undefined
        ? {
            firstName: body.firstName?.trim() ?? '',
            lastName: body.lastName?.trim() ?? '',
          }
        : this.helpers.parsePersonName(body.name ?? 'User');
    const record = await this.prisma.user.create({
      data: {
        tenantId,
        email: body.email ?? `user-${Date.now()}@hris.local`,
        passwordHash: '$2b$10$placeholderhashplaceholderhashpl',
        firstName,
        lastName,
        isActive: body.status !== 'inactive',
      },
    });
    return mapUser(record);
  }

  async update(
    tenantId: string,
    id: string,
    body: {
      name?: string;
      firstName?: string;
      lastName?: string;
      status?: string;
    },
  ): Promise<ListEntityDto> {
    const record = await this.findOrThrow(tenantId, id);
    const data: {
      firstName?: string;
      lastName?: string;
      isActive?: boolean;
    } = {};
    if (body.firstName !== undefined || body.lastName !== undefined) {
      if (body.firstName !== undefined) data.firstName = body.firstName.trim();
      if (body.lastName !== undefined) data.lastName = body.lastName.trim();
    } else if (body.name) {
      const parsed = this.helpers.parsePersonName(body.name);
      data.firstName = parsed.firstName;
      data.lastName = parsed.lastName;
    }
    if (body.status !== undefined) {
      data.isActive = body.status !== 'inactive';
    }
    const updated = await this.prisma.user.update({
      where: { id: record.id },
      data,
    });
    return mapUser(updated);
  }

  async softDelete(tenantId: string, id: string): Promise<ListEntityDto> {
    await this.findOrThrow(tenantId, id);
    const updated = await this.prisma.user.update({
      where: { id },
      data: { ...softDeleteData(), isActive: false },
    });
    return mapUser(updated);
  }

  async restore(tenantId: string, id: string): Promise<ListEntityDto> {
    const record = await this.prisma.user.findFirst({
      where: { id, ...tenantTrashedWhere(tenantId) },
    });
    if (!record) this.helpers.throwNotFound('User');
    const updated = await this.prisma.user.update({
      where: { id },
      data: { ...restoreData(), isActive: true },
    });
    return mapUser(updated);
  }

  async deactivate(tenantId: string, id: string): Promise<ListEntityDto> {
    return this.softDelete(tenantId, id);
  }

  async reactivate(tenantId: string, id: string): Promise<ListEntityDto> {
    return this.restore(tenantId, id);
  }

  async getUserRoles(tenantId: string, userId: string) {
    await this.findOrThrow(tenantId, userId);
    const rows = await this.prisma.userRole.findMany({
      where: { userId },
      include: { role: true },
    });
    return rows.map((row) => ({
      id: row.role.id,
      name: row.role.name,
      slug: row.role.slug,
    }));
  }

  async setUserRoles(
    actor: RequestUser,
    tenantId: string,
    userId: string,
    roleIds: string[],
  ) {
    const target = await this.findOrThrow(tenantId, userId);
    if (target.role === 'superadmin' && actor.role !== 'superadmin') {
      throw new AppException(
        ErrorCodes.AUTH_FORBIDDEN,
        'Cannot modify superadmin roles',
        HttpStatus.FORBIDDEN,
      );
    }
    if (actor.role !== 'superadmin') {
      const roles = await this.prisma.role.findMany({
        where: { id: { in: roleIds }, tenantId },
      });
      if (roles.some((role) => role.slug === 'superadmin')) {
        throw new AppException(
          ErrorCodes.AUTH_FORBIDDEN,
          'Cannot assign superadmin role',
          HttpStatus.FORBIDDEN,
        );
      }
    }
    for (const roleId of roleIds) {
      await this.prisma.role.findFirstOrThrow({ where: { id: roleId, tenantId } });
    }
    await this.prisma.userRole.deleteMany({ where: { userId } });
    if (roleIds.length > 0) {
      await this.prisma.userRole.createMany({
        data: roleIds.map((roleId) => ({ userId, roleId })),
      });
    }
    return { ok: true };
  }

  async remove(tenantId: string, id: string) {
    await this.findOrThrow(tenantId, id);
    await this.prisma.user.delete({ where: { id } });
    return { id, deleted: true };
  }
}
