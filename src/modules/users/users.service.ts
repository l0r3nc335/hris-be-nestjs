import { Injectable } from '@nestjs/common';
import { HrRecordsService } from '../../common/services/hr-records.service';
import { PrismaService } from '../../database/prisma.service';
import { AuthService, UserResponse } from '../auth/auth.service';

const ENTITY = 'users';

@Injectable()
export class UsersService {
  constructor(
    private readonly hr: HrRecordsService,
    private readonly prisma: PrismaService,
    private readonly auth: AuthService,
  ) {}

  list(tenantId: string) {
    return this.hr.list(tenantId, ENTITY);
  }

  get(tenantId: string, id: string) {
    return this.hr.getById(tenantId, ENTITY, id);
  }

  async getProfile(tenantId: string, userId: string): Promise<UserResponse> {
    const user = await this.prisma.user.findFirst({
      where: { id: userId, tenantId },
    });
    if (!user)
      return this.hr.getById(
        tenantId,
        ENTITY,
        userId,
      ) as unknown as UserResponse;
    return this.auth.me({
      id: user.id,
      tenantId: user.tenantId,
      email: user.email,
      role: user.role,
      permissions: [],
      isActive: user.isActive,
    });
  }

  search(tenantId: string, q?: string) {
    return this.hr
      .list(tenantId, ENTITY)
      .then((items) =>
        q
          ? items.filter((i) => i.name.toLowerCase().includes(q.toLowerCase()))
          : items,
      );
  }

  active(tenantId: string) {
    return this.hr.list(tenantId, ENTITY);
  }

  inactive(tenantId: string) {
    return this.hr
      .list(tenantId, ENTITY)
      .then((items) => items.map((i) => ({ ...i, status: 'inactive' })));
  }

  create(tenantId: string, body: { name?: string; email?: string }) {
    return this.hr.createStub(tenantId, ENTITY, body.name ?? 'User');
  }

  update(
    tenantId: string,
    id: string,
    body: { name?: string; status?: string },
  ) {
    return this.hr.getById(tenantId, ENTITY, id).then((e) => ({
      ...e,
      name: body.name ?? e.name,
      status: body.status ?? e.status,
    }));
  }

  deactivate(tenantId: string, id: string) {
    return this.update(tenantId, id, { status: 'inactive' });
  }

  reactivate(tenantId: string, id: string) {
    return this.update(tenantId, id, { status: 'active' });
  }

  remove(_tenantId: string, id: string) {
    return { id, deleted: true };
  }
}
