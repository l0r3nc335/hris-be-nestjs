import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { BillingService } from './billing.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { ctxFromUser } from '../../common/helpers/tenant-context.helper';
import { RequestUser } from '../../common/types/request-user';

@ApiTags('billing')
@Controller('billing')
@Permissions('billing:read')
export class BillingController {
  constructor(private readonly service: BillingService) {}

  @Get('subscription')
  subscription() {
    return this.service.subscription();
  }

  @Post('subscribe')
  @Permissions('billing:write')
  subscribe(@Body() body: Record<string, string>) {
    return this.service.subscribe(body);
  }

  @Post('cancel')
  @Permissions('billing:write')
  cancel() {
    return this.service.cancel();
  }

  @Get('payment-methods')
  paymentMethods() {
    return this.service.paymentMethods();
  }

  @Get('invoices')
  invoices(@CurrentUser() user: RequestUser, @Query() query: PaginationQueryDto) {
    return this.service.invoices(ctxFromUser(user), query);
  }

  @Get('invoices/trashed')
  listTrashedInvoices(@CurrentUser() user: RequestUser, @Query() query: PaginationQueryDto) {
    return this.service.listTrashedInvoices(ctxFromUser(user), query);
  }

  @Post('invoices')
  @Permissions('billing:write')
  createInvoice(
    @CurrentUser() user: RequestUser,
    @Body() body: { amount?: number; status?: string },
  ) {
    return this.service.createInvoice(ctxFromUser(user), body);
  }

  @Patch('invoices/:id/soft-delete')
  @Permissions('billing:write')
  softDeleteInvoice(
    @CurrentUser() user: RequestUser,
    @Param('id') id: string,
  ) {
    return this.service.softDeleteInvoice(ctxFromUser(user), id);
  }

  @Patch('invoices/:id/restore')
  @Permissions('billing:write')
  restoreInvoice(
    @CurrentUser() user: RequestUser,
    @Param('id') id: string,
  ) {
    return this.service.restoreInvoice(ctxFromUser(user), id);
  }

  @Get('invoices/:id')
  invoice(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    return this.service.invoice(ctxFromUser(user), id);
  }

  @Put('invoices/:id')
  @Patch('invoices/:id')
  @Permissions('billing:write')
  updateInvoice(
    @CurrentUser() user: RequestUser,
    @Param('id') id: string,
    @Body() body: { amount?: number; status?: string },
  ) {
    return this.service.updateInvoice(ctxFromUser(user), id, body);
  }

  @Delete('invoices/:id')
  @Permissions('billing:write')
  removeInvoice(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    return this.service.removeInvoice(ctxFromUser(user), id);
  }
}
