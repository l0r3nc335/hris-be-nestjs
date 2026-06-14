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
import { AttendanceService } from './attendance.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { RequestUser } from '../../common/types/request-user';

@ApiTags('attendance')
@Controller('attendance')
@Permissions('employees:read')
export class AttendanceController {
  constructor(private readonly service: AttendanceService) {}

  @Post('check-in')
  @Permissions('employees:write')
  checkIn(
    @CurrentUser() user: RequestUser,
    @Body() body: Record<string, string>,
  ) {
    return this.service.checkIn(user.tenantId, body);
  }

  @Post('check-out')
  @Permissions('employees:write')
  checkOut(
    @CurrentUser() user: RequestUser,
    @Body() body: Record<string, string>,
  ) {
    return this.service.checkOut(user.tenantId, body);
  }

  @Get('today')
  today(@CurrentUser() user: RequestUser) {
    return this.service.today(user.tenantId);
  }

  @Get('range')
  range(
    @CurrentUser() user: RequestUser,
    @Query('start') start?: string,
    @Query('end') end?: string,
  ) {
    return this.service.range(user.tenantId, start, end);
  }

  @Get('summary/:employeeId')
  summary(
    @CurrentUser() user: RequestUser,
    @Param('employeeId') employeeId: string,
  ) {
    return this.service.summary(user.tenantId, employeeId);
  }

  @Get()
  list(@CurrentUser() user: RequestUser) {
    return this.service.list(user.tenantId);
  }

  @Get('trashed')
  listTrashed(@CurrentUser() user: RequestUser) {
    return this.service.listTrashed(user.tenantId);
  }

  @Patch(':id/soft-delete')
  @Permissions('employees:write')
  softDelete(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    return this.service.softDelete(user.tenantId, id);
  }

  @Patch(':id/restore')
  @Permissions('employees:write')
  restore(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    return this.service.restore(user.tenantId, id);
  }

  @Get(':employeeId')
  byEmployee(
    @CurrentUser() user: RequestUser,
    @Param('employeeId') employeeId: string,
  ) {
    return this.service.byEmployee(user.tenantId, employeeId);
  }

  @Get(':id')
  get(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    return this.service.get(user.tenantId, id);
  }

  @Post()
  @Permissions('employees:write')
  create(
    @CurrentUser() user: RequestUser,
    @Body() body: Record<string, string>,
  ) {
    return this.service.create(user.tenantId, body);
  }

  @Put(':id')
  @Patch(':id')
  @Permissions('employees:write')
  update(
    @CurrentUser() user: RequestUser,
    @Param('id') id: string,
    @Body() body: Record<string, string>,
  ) {
    return this.service.update(user.tenantId, id, body);
  }

  @Delete(':id')
  @Permissions('employees:write')
  remove(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    return this.service.remove(user.tenantId, id);
  }
}
