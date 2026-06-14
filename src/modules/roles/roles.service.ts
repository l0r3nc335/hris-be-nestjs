import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { mapRole } from '../../common/mappers/domain.mappers';
import { ListEntityDto } from '../../common/mappers/list-entity.mapper';
import { EntityNotFoundHelper } from '../../common/helpers/entity-not-found.helper';
import {
  restoreData,
  softDeleteData,
  tenantActiveWhere,
  tenantTrashedWhere,
} from '../../common/services/soft-delete-crud.helper';

@Injectable()
export class RolesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly helpers: EntityNotFoundHelper,
  ) {}

  private async findOrThrow(tenantId: string, id: string) {
    const record = await this.prisma.role.findFirst({
      where: { id, tenantId },
    });
    if (!record) this.helpers.throwNotFound('Role');
    return record;
  }

  async list(tenantId: string): Promise<ListEntityDto[]> {
    const records = await this.prisma.role.findMany({
      where: tenantActiveWhere(tenantId),
      orderBy: { createdAt: 'desc' },
    });
    return records.map(mapRole);
  }

  async listTrashed(tenantId: string): Promise<ListEntityDto[]> {
    const records = await this.prisma.role.findMany({
      where: tenantTrashedWhere(tenantId),
      orderBy: { createdAt: 'desc' },
    });
    return records.map(mapRole);
  }

  async get(tenantId: string, id: string): Promise<ListEntityDto> {
    return mapRole(await this.findOrThrow(tenantId, id));
  }

  async create(
    tenantId: string,
    body: { name: string; slug?: string },
  ): Promise<ListEntityDto> {
    const record = await this.prisma.role.create({
      data: {
        tenantId,
        name: body.name,
        slug: body.slug ?? body.name.toLowerCase().replace(/\s+/g, '-'),
      },
    });
    return mapRole(record);
  }

  async update(
    tenantId: string,
    id: string,
    body: { name?: string },
  ): Promise<ListEntityDto> {
    await this.findOrThrow(tenantId, id);
    const updated = await this.prisma.role.update({
      where: { id },
      data: { name: body.name },
    });
    return mapRole(updated);
  }

  async softDelete(tenantId: string, id: string): Promise<ListEntityDto> {
    await this.findOrThrow(tenantId, id);
    const updated = await this.prisma.role.update({
      where: { id },
      data: softDeleteData(),
    });
    return mapRole(updated);
  }

  async restore(tenantId: string, id: string): Promise<ListEntityDto> {
    const record = await this.prisma.role.findFirst({
      where: { id, ...tenantTrashedWhere(tenantId) },
    });
    if (!record) this.helpers.throwNotFound('Role');
    const updated = await this.prisma.role.update({
      where: { id },
      data: restoreData(),
    });
    return mapRole(updated);
  }

  async remove(tenantId: string, id: string) {
    await this.findOrThrow(tenantId, id);
    await this.prisma.role.delete({ where: { id } });
    return { id, deleted: true };
  }

  listPermissions() {
    return this.prisma.permission.findMany();
  }

  rolePermissions(roleId: string) {
    return this.prisma.rolePermission.findMany({
      where: { roleId },
      include: { permission: true },
    });
  }

  assignPermissions(roleId: string, permissionIds: string[]) {
    return Promise.all(
      permissionIds.map((permissionId) =>
        this.prisma.rolePermission.upsert({
          where: { roleId_permissionId: { roleId, permissionId } },
          create: { roleId, permissionId },
          update: {},
        }),
      ),
    );
  }
}
