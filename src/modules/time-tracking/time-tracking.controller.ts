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
import { ctxFromUser } from '../../common/helpers/tenant-context.helper';
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
    return this.service.start(ctxFromUser(user), body);
  }

  @Post('stop')
  @Permissions('employees:write')
  stop(@CurrentUser() user: RequestUser, @Body() body: Record<string, string>) {
    return this.service.stop(ctxFromUser(user), body);
  }

  @Get('today/:employeeId')
  today(@Param('employeeId') employeeId: string) {
    return this.service.today('', employeeId);
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
  @Permissions('employees:write')
  softDelete(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    return this.service.softDelete(ctxFromUser(user), id);
  }

  @Patch(':id/restore')
  @Permissions('employees:write')
  restore(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    return this.service.restore(ctxFromUser(user), id);
  }

  @Get(':employeeId')
  byEmployee(
    @CurrentUser() user: RequestUser,
    @Param('employeeId') employeeId: string,
  ) {
    return this.service.byEmployee(ctxFromUser(user), employeeId);
  }

  @Get(':id')
  get(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    return this.service.get(ctxFromUser(user), id);
  }

  @Post()
  @Permissions('employees:write')
  create(
    @CurrentUser() user: RequestUser,
    @Body() body: Record<string, string>,
  ) {
    return this.service.create(ctxFromUser(user), body);
  }

  @Put(':id')
  @Patch(':id')
  @Permissions('employees:write')
  update(
    @CurrentUser() user: RequestUser,
    @Param('id') id: string,
    @Body() body: Record<string, string>,
  ) {
    return this.service.update(ctxFromUser(user), id, body);
  }

  @Delete(':id')
  @Permissions('employees:write')
  remove(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    return this.service.remove(ctxFromUser(user), id);
  }
}
