import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { HrRecordsService } from '../../common/services/hr-records.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { RequestUser } from '../../common/types/request-user';

@ApiTags('billing')
@Controller('billing')
@Permissions('billing:read')
export class BillingController {
  constructor(private readonly hr: HrRecordsService) {}

  @Get('subscription')
  subscription() {
    return { plan: 'enterprise', status: 'active' };
  }

  @Post('subscribe')
  subscribe(@Body() body: Record<string, string>) {
    return { plan: body.plan ?? 'enterprise', status: 'active' };
  }

  @Post('cancel')
  cancel() {
    return { status: 'cancelled' };
  }

  @Get('payment-methods')
  paymentMethods() {
    return [];
  }

  @Get('invoices')
  invoices(@CurrentUser() user: RequestUser) {
    return this.hr.list(user.tenantId, 'billing-invoices');
  }

  @Get('invoices/:id')
  invoice(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    return this.hr.getById(user.tenantId, 'billing-invoices', id);
  }
}
