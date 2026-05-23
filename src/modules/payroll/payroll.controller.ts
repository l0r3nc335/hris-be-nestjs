import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PayrollService } from './payroll.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { RequestUser } from '../../common/types/request-user';

@ApiTags('payroll')
@Controller('payroll')
@Permissions('payroll:read')
export class PayrollController {
  constructor(private readonly service: PayrollService) {}

  @Post('generate')
  @Permissions('payroll:run')
  generate(
    @CurrentUser() user: RequestUser,
    @Body() body: Record<string, string>,
  ) {
    return this.service.generate(user.tenantId, body);
  }

  @Post('run')
  @Permissions('payroll:run')
  run(@CurrentUser() user: RequestUser, @Body() body: Record<string, string>) {
    return this.service.run(user.tenantId, body);
  }

  @Get('summary')
  summary(@CurrentUser() user: RequestUser) {
    return this.service.summary(user.tenantId);
  }

  @Get('history')
  history(@CurrentUser() user: RequestUser) {
    return this.service.history(user.tenantId);
  }

  @Get('slips/:employeeId')
  slips(
    @CurrentUser() user: RequestUser,
    @Param('employeeId') employeeId: string,
  ) {
    return this.service.slips(user.tenantId, employeeId);
  }

  @Get()
  list(@CurrentUser() user: RequestUser) {
    return this.service.list(user.tenantId);
  }

  @Get(':id')
  get(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    return this.service.get(user.tenantId, id);
  }

  @Post()
  @Permissions('payroll:run')
  create(
    @CurrentUser() user: RequestUser,
    @Body() body: Record<string, string>,
  ) {
    return this.service.create(user.tenantId, body);
  }

  @Put(':id')
  @Patch(':id')
  @Permissions('payroll:run')
  update(
    @CurrentUser() user: RequestUser,
    @Param('id') id: string,
    @Body() body: Record<string, string>,
  ) {
    return this.service.update(user.tenantId, id, body);
  }

  @Delete(':id')
  @Permissions('payroll:run')
  remove(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    return this.service.remove(user.tenantId, id);
  }
}
