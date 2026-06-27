import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { SettingsService } from './settings.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { ctxFromUser } from '../../common/helpers/tenant-context.helper';
import { RequestUser } from '../../common/types/request-user';

@ApiTags('settings')
@Controller('settings')
@Permissions('settings:write')
export class SettingsController {
  constructor(private readonly service: SettingsService) {}

  @Get('company')
  company(@CurrentUser() user: RequestUser) {
    return this.service.company(ctxFromUser(user));
  }

  @Put('company')
  updateCompany(
    @CurrentUser() user: RequestUser,
    @Body() body: Record<string, string>,
  ) {
    return this.service.updateCompany(ctxFromUser(user), body);
  }

  @Get('leave-types')
  leaveTypes(@CurrentUser() user: RequestUser, @Query() query: PaginationQueryDto) {
    return this.service.leaveTypes(ctxFromUser(user), query);
  }

  @Get('leave-types/trashed')
  listTrashedLeaveTypes(@CurrentUser() user: RequestUser, @Query() query: PaginationQueryDto) {
    return this.service.listTrashedLeaveTypes(ctxFromUser(user), query);
  }

  @Post('leave-types')
  createLeaveType(
    @CurrentUser() user: RequestUser,
    @Body() body: { name?: string },
  ) {
    return this.service.createLeaveType(ctxFromUser(user), body);
  }

  @Patch('leave-types/:id/soft-delete')
  softDeleteLeaveType(
    @CurrentUser() user: RequestUser,
    @Param('id') id: string,
  ) {
    return this.service.softDeleteLeaveType(ctxFromUser(user), id);
  }

  @Patch('leave-types/:id/restore')
  restoreLeaveType(
    @CurrentUser() user: RequestUser,
    @Param('id') id: string,
  ) {
    return this.service.restoreLeaveType(ctxFromUser(user), id);
  }

  @Put('leave-types/:id')
  @Patch('leave-types/:id')
  updateLeaveType(
    @CurrentUser() user: RequestUser,
    @Param('id') id: string,
    @Body() body: { name?: string; status?: string },
  ) {
    return this.service.updateLeaveType(ctxFromUser(user), id, body);
  }

  @Delete('leave-types/:id')
  removeLeaveType(
    @CurrentUser() user: RequestUser,
    @Param('id') id: string,
  ) {
    return this.service.removeLeaveType(ctxFromUser(user), id);
  }

  @Get()
  root(@CurrentUser() user: RequestUser, @Query() query: PaginationQueryDto) {
    return this.service.list(ctxFromUser(user), query);
  }

  @Get('trashed')
  listTrashed(@CurrentUser() user: RequestUser, @Query() query: PaginationQueryDto) {
    return this.service.listTrashed(ctxFromUser(user), query);
  }

  @Post()
  create(
    @CurrentUser() user: RequestUser,
    @Body() body: { key?: string; value?: string; status?: string },
  ) {
    return this.service.create(ctxFromUser(user), body);
  }

  @Patch(':id/soft-delete')
  softDelete(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    return this.service.softDelete(ctxFromUser(user), id);
  }

  @Patch(':id/restore')
  restore(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    return this.service.restore(ctxFromUser(user), id);
  }

  @Get(':id')
  get(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    return this.service.get(ctxFromUser(user), id);
  }

  @Put()
  update(
    @CurrentUser() user: RequestUser,
    @Body() body: Record<string, string>,
  ) {
    return this.service.update(ctxFromUser(user), body);
  }

  @Delete(':id')
  remove(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    return this.service.remove(ctxFromUser(user), id);
  }
}
