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
import { TimeTrackingService } from './time-tracking.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { RequestUser } from '../../common/types/request-user';

@ApiTags('time-tracking')
@Controller('time-logs')
@Permissions('employees:read')
export class TimeTrackingController {
  constructor(private readonly service: TimeTrackingService) {}

  @Post('start')
  @Permissions('employees:write')
  start(
    @CurrentUser() user: RequestUser,
    @Body() body: Record<string, string>,
  ) {
    return this.service.start(user.tenantId, body);
  }

  @Post('stop')
  @Permissions('employees:write')
  stop(@CurrentUser() user: RequestUser, @Body() body: Record<string, string>) {
    return this.service.stop(user.tenantId, body);
  }

  @Get('today/:employeeId')
  today(@Param('employeeId') employeeId: string) {
    return this.service.today('', employeeId);
  }

  @Get()
  list(@CurrentUser() user: RequestUser, @Query() query: PaginationQueryDto) {
    return this.service.list(user.tenantId, query);
  }

  @Get('trashed')
  listTrashed(@CurrentUser() user: RequestUser, @Query() query: PaginationQueryDto) {
    return this.service.listTrashed(user.tenantId, query);
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
