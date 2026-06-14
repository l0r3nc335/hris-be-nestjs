import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { EntityNotFoundHelper } from '../../common/helpers/entity-not-found.helper';
import { mapBillingInvoice } from '../../common/mappers/domain.mappers';
import { ListEntityDto } from '../../common/mappers/list-entity.mapper';
import {
  restoreData,
  softDeleteData,
  tenantActiveWhere,
  tenantTrashedWhere,
} from '../../common/services/soft-delete-crud.helper';

@Injectable()
export class BillingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly helpers: EntityNotFoundHelper,
  ) {}

  private async findInvoiceOrThrow(tenantId: string, id: string) {
    const record = await this.prisma.billingInvoice.findFirst({
      where: { id, tenantId },
    });
    if (!record) this.helpers.throwNotFound('Invoice');
    return record;
  }

  subscription() {
    return { plan: 'enterprise', status: 'active' };
  }

  subscribe(body: Record<string, string>) {
    return { plan: body.plan ?? 'enterprise', status: 'active' };
  }

  cancel() {
    return { status: 'cancelled' };
  }

  paymentMethods() {
    return [];
  }

  async invoices(tenantId: string): Promise<ListEntityDto[]> {
    const records = await this.prisma.billingInvoice.findMany({
      where: tenantActiveWhere(tenantId),
      orderBy: { createdAt: 'desc' },
    });
    return records.map(mapBillingInvoice);
  }

  async listTrashedInvoices(tenantId: string): Promise<ListEntityDto[]> {
    const records = await this.prisma.billingInvoice.findMany({
      where: tenantTrashedWhere(tenantId),
      orderBy: { createdAt: 'desc' },
    });
    return records.map(mapBillingInvoice);
  }

  async invoice(tenantId: string, id: string): Promise<ListEntityDto> {
    return mapBillingInvoice(await this.findInvoiceOrThrow(tenantId, id));
  }

  async createInvoice(
    tenantId: string,
    body: { amount?: number; status?: string },
  ): Promise<ListEntityDto> {
    const record = await this.prisma.billingInvoice.create({
      data: {
        tenantId,
        amount: body.amount ?? 0,
        status: body.status ?? 'pending',
        dueDate: new Date(Date.now() + 30 * 86400000),
      },
    });
    return mapBillingInvoice(record);
  }

  async updateInvoice(
    tenantId: string,
    id: string,
    body: { amount?: number; status?: string },
  ): Promise<ListEntityDto> {
    await this.findInvoiceOrThrow(tenantId, id);
    const updated = await this.prisma.billingInvoice.update({
      where: { id },
      data: {
        amount: body.amount,
        status: body.status,
      },
    });
    return mapBillingInvoice(updated);
  }

  async softDeleteInvoice(tenantId: string, id: string): Promise<ListEntityDto> {
    await this.findInvoiceOrThrow(tenantId, id);
    const updated = await this.prisma.billingInvoice.update({
      where: { id },
      data: softDeleteData(),
    });
    return mapBillingInvoice(updated);
  }

  async restoreInvoice(tenantId: string, id: string): Promise<ListEntityDto> {
    const record = await this.prisma.billingInvoice.findFirst({
      where: { id, ...tenantTrashedWhere(tenantId) },
    });
    if (!record) this.helpers.throwNotFound('Invoice');
    const updated = await this.prisma.billingInvoice.update({
      where: { id },
      data: restoreData(),
    });
    return mapBillingInvoice(updated);
  }

  async removeInvoice(tenantId: string, id: string) {
    await this.findInvoiceOrThrow(tenantId, id);
    await this.prisma.billingInvoice.delete({ where: { id } });
    return { id, deleted: true };
  }
}
