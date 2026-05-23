import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Permissions } from '../../common/decorators/permissions.decorator';

@ApiTags('reports')
@Controller('reports')
@Permissions('reports:read')
export class ReportsController {
  @Get('employees')
  employees() {
    return { total: 128 };
  }

  @Get('attendance')
  attendance() {
    return { rate: 0.94 };
  }

  @Get('payroll')
  payroll() {
    return { total: 450000 };
  }

  @Get('leave-usage')
  leaveUsage() {
    return { days: 320 };
  }

  @Get('turnover')
  turnover() {
    return { rate: 0.08 };
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return { id, report: 'summary' };
  }
}
