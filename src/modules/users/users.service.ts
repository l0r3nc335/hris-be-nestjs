import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { AuthService } from '../auth/auth.service';
import { EntityNotFoundHelper } from '../../common/helpers/entity-not-found.helper';
import { mapUser } from '../../common/mappers/domain.mappers';
import { ListEntityDto } from '../../common/mappers/list-entity.mapper';
import {
  restoreData,
  softDeleteData,
  tenantActiveWhere,
  tenantTrashedWhere,
} from '../../common/services/soft-delete-crud.helper';

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

  async list(tenantId: string): Promise<ListEntityDto[]> {
    const records = await this.prisma.user.findMany({
      where: tenantActiveWhere(tenantId),
      orderBy: { createdAt: 'desc' },
    });
    return records.map(mapUser);
  }

  async listTrashed(tenantId: string): Promise<ListEntityDto[]> {
    const records = await this.prisma.user.findMany({
      where: tenantTrashedWhere(tenantId),
      orderBy: { createdAt: 'desc' },
    });
    return records.map(mapUser);
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
    const items = await this.list(tenantId);
    if (!q) return items;
    const lower = q.toLowerCase();
    return items.filter((i) => i.name.toLowerCase().includes(lower));
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
    body: { name?: string; email?: string; status?: string },
  ): Promise<ListEntityDto> {
    const { firstName, lastName } = this.helpers.parsePersonName(
      body.name ?? 'User',
    );
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
    body: { name?: string; status?: string },
  ): Promise<ListEntityDto> {
    const record = await this.findOrThrow(tenantId, id);
    const data: {
      firstName?: string;
      lastName?: string;
      isActive?: boolean;
    } = {};
    if (body.name) {
      const parsed = this.helpers.parsePersonName(body.name);
      data.firstName = parsed.firstName;
      data.lastName = parsed.lastName;
    }
    if (body.status) data.isActive = body.status === 'active';
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

  async remove(tenantId: string, id: string) {
    await this.findOrThrow(tenantId, id);
    await this.prisma.user.delete({ where: { id } });
    return { id, deleted: true };
  }
}
