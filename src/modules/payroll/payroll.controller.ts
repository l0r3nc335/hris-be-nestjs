import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { PayrollService } from './payroll.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { ctxFromUser } from '../../common/helpers/tenant-context.helper';
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
    return this.service.generate(ctxFromUser(user), body);
  }

  @Post('run')
  @Permissions('payroll:run')
  run(@CurrentUser() user: RequestUser, @Body() body: Record<string, string>) {
    return this.service.run(ctxFromUser(user), body);
  }

  @Get('summary')
  summary(@CurrentUser() user: RequestUser) {
    return this.service.summary(ctxFromUser(user));
  }

  @Get('history')
  history(@CurrentUser() user: RequestUser) {
    return this.service.history(ctxFromUser(user));
  }

  @Get('slips/:employeeId')
  slips(
    @CurrentUser() user: RequestUser,
    @Param('employeeId') employeeId: string,
  ) {
    return this.service.slips(ctxFromUser(user), employeeId);
  }

  @Get()
  list(@CurrentUser() user: RequestUser, @Query() query: PaginationQueryDto) {
    return this.service.list(ctxFromUser(user), query);
  }

  @Get('trashed')
  listTrashed(@CurrentUser() user: RequestUser, @Query() query: PaginationQueryDto) {
    return this.service.listTrashed(ctxFromUser(user), query);
  }

  @Patch(':id/soft-delete')
  @Permissions('payroll:run')
  softDelete(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    return this.service.softDelete(ctxFromUser(user), id);
  }

  @Patch(':id/restore')
  @Permissions('payroll:run')
  restore(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    return this.service.restore(ctxFromUser(user), id);
  }

  @Get(':id')
  get(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    return this.service.get(ctxFromUser(user), id);
  }

  @Post()
  @Permissions('payroll:run')
  create(
    @CurrentUser() user: RequestUser,
    @Body() body: Record<string, string>,
  ) {
    return this.service.create(ctxFromUser(user), body);
  }

  @Put(':id')
  @Patch(':id')
  @Permissions('payroll:run')
  update(
    @CurrentUser() user: RequestUser,
    @Param('id') id: string,
    @Body() body: Record<string, string>,
  ) {
    return this.service.update(ctxFromUser(user), id, body);
  }

  @Delete(':id')
  @Permissions('payroll:run')
  remove(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    return this.service.remove(ctxFromUser(user), id);
  }
}
