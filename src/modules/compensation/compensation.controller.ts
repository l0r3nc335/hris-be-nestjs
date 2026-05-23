import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CompensationService } from './compensation.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { RequestUser } from '../../common/types/request-user';

@ApiTags('compensation')
@Controller()
@Permissions('payroll:read')
export class CompensationController {
  constructor(private readonly service: CompensationService) {}

  @Get('compensation')
  list(@CurrentUser() user: RequestUser) {
    return this.service.list(user.tenantId);
  }

  @Get('compensation/:employeeId')
  byEmployee(@Param('employeeId') employeeId: string) {
    return this.service.byEmployee('', employeeId);
  }

  @Put('compensation/:employeeId')
  updateCompensation(
    @CurrentUser() user: RequestUser,
    @Param('employeeId') employeeId: string,
    @Body() body: Record<string, unknown>,
  ) {
    void body;
    return this.service.byEmployee(user.tenantId, employeeId);
  }

  @Post('compensation/:employeeId/adjust')
  adjust(
    @CurrentUser() user: RequestUser,
    @Param('employeeId') employeeId: string,
    @Body() body: Record<string, unknown>,
  ) {
    return this.service.adjust(user.tenantId, employeeId, body);
  }

  @Get('salary-structures')
  salaryStructures(@CurrentUser() user: RequestUser) {
    return this.service.salaryStructures(user.tenantId);
  }

  @Post('salary-structures')
  createStructure(
    @CurrentUser() user: RequestUser,
    @Body() body: Record<string, string>,
  ) {
    return this.service.createStructure(user.tenantId, body);
  }
}
