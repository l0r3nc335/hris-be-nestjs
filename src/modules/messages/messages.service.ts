import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { EntityNotFoundHelper } from '../../common/helpers/entity-not-found.helper';
import { mapMessage } from '../../common/mappers/domain.mappers';
import {
  tenantActiveWhere,
} from '../../common/services/soft-delete-crud.helper';

export interface InboxMessageDto {
  id: string;
  from: string;
  subject: string;
  body: string;
  read: boolean;
}

@Injectable()
export class MessagesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly helpers: EntityNotFoundHelper,
  ) {}

  private async findOrThrow(tenantId: string, userId: string, id: string) {
    const record = await this.prisma.message.findFirst({
      where: { id, tenantId, userId },
    });
    if (!record) this.helpers.throwNotFound('Message');
    return record;
  }

  async inbox(tenantId: string, userId: string): Promise<InboxMessageDto[]> {
    const records = await this.prisma.message.findMany({
      where: { ...tenantActiveWhere(tenantId), userId },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
    return records.map(mapMessage);
  }

  async markRead(tenantId: string, userId: string, id: string) {
    await this.findOrThrow(tenantId, userId, id);
    await this.prisma.message.update({
      where: { id },
      data: { read: true },
    });
    return { id, read: true };
  }

  async markAllRead(tenantId: string, userId: string) {
    await this.prisma.message.updateMany({
      where: { ...tenantActiveWhere(tenantId), userId, read: false },
      data: { read: true },
    });
    return { updated: true };
  }
}
