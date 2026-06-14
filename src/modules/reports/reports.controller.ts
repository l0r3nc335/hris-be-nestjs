import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { ReportsService } from './reports.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RequestUser } from '../../common/types/request-user';

@ApiTags('reports')
@Controller('reports')
@Permissions('reports:read')
export class ReportsController {
  constructor(private readonly service: ReportsService) {}

  @Get()
  catalog(@CurrentUser() user: RequestUser) {
    return this.service.catalog(user.tenantId);
  }

  @Get('employees')
  employees(@CurrentUser() user: RequestUser) {
    return this.service.employees(user.tenantId);
  }

  @Get('attendance')
  attendance(@CurrentUser() user: RequestUser) {
    return this.service.attendance(user.tenantId);
  }

  @Get('payroll')
  payroll(@CurrentUser() user: RequestUser) {
    return this.service.payroll(user.tenantId);
  }

  @Get('leave-usage')
  leaveUsage(@CurrentUser() user: RequestUser) {
    return this.service.leaveUsage(user.tenantId);
  }

  @Get('turnover')
  turnover(@CurrentUser() user: RequestUser) {
    return this.service.turnover(user.tenantId);
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.service.get(id);
  }
}
