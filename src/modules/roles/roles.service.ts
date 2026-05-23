import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { HrRecordsService } from '../../common/services/hr-records.service';

@Injectable()
export class RolesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly hr: HrRecordsService,
  ) {}

  list(tenantId: string) {
    return this.prisma.role.findMany({ where: { tenantId } });
  }

  get(tenantId: string, id: string) {
    return this.prisma.role.findFirst({ where: { id, tenantId } });
  }

  create(tenantId: string, body: { name: string; slug?: string }) {
    return this.prisma.role.create({
      data: {
        tenantId,
        name: body.name,
        slug: body.slug ?? body.name.toLowerCase().replace(/\s+/g, '-'),
      },
    });
  }

  update(tenantId: string, id: string, body: { name?: string }) {
    return this.prisma.role.update({
      where: { id },
      data: { name: body.name },
    });
  }

  remove(tenantId: string, id: string) {
    return this.prisma.role.deleteMany({ where: { id, tenantId } });
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
