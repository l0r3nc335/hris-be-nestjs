import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
@Injectable()
export class TenantsService {
  constructor(private readonly prisma: PrismaService) {}

  list() {
    return this.prisma.tenant.findMany();
  }

  get(id: string) {
    return this.prisma.tenant.findUnique({ where: { id } });
  }

  create(body: { name: string; slug: string }) {
    return this.prisma.tenant.create({
      data: { name: body.name, slug: body.slug, status: 'active' },
    });
  }

  update(id: string, body: { name?: string; status?: string }) {
    return this.prisma.tenant.update({ where: { id }, data: body });
  }

  suspend(id: string) {
    return this.prisma.tenant.update({
      where: { id },
      data: { status: 'suspended' },
    });
  }

  reactivate(id: string) {
    return this.prisma.tenant.update({
      where: { id },
      data: { status: 'active' },
    });
  }
}
