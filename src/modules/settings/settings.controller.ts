import { Body, Controller, Delete, Get, Param, Patch, Post, Put } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SettingsService } from './settings.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { RequestUser } from '../../common/types/request-user';

@ApiTags('settings')
@Controller('settings')
@Permissions('settings:write')
export class SettingsController {
  constructor(private readonly service: SettingsService) {}

  @Get('company')
  company(@CurrentUser() user: RequestUser) {
    return this.service.company(user.tenantId);
  }

  @Put('company')
  updateCompany(
    @CurrentUser() user: RequestUser,
    @Body() body: Record<string, string>,
  ) {
    return this.service.updateCompany(user.tenantId, body);
  }

  @Get('leave-types')
  leaveTypes(@CurrentUser() user: RequestUser) {
    return this.service.leaveTypes(user.tenantId);
  }

  @Get('leave-types/trashed')
  listTrashedLeaveTypes(@CurrentUser() user: RequestUser) {
    return this.service.listTrashedLeaveTypes(user.tenantId);
  }

  @Post('leave-types')
  createLeaveType(
    @CurrentUser() user: RequestUser,
    @Body() body: { name?: string },
  ) {
    return this.service.createLeaveType(user.tenantId, body);
  }

  @Patch('leave-types/:id/soft-delete')
  softDeleteLeaveType(
    @CurrentUser() user: RequestUser,
    @Param('id') id: string,
  ) {
    return this.service.softDeleteLeaveType(user.tenantId, id);
  }

  @Patch('leave-types/:id/restore')
  restoreLeaveType(
    @CurrentUser() user: RequestUser,
    @Param('id') id: string,
  ) {
    return this.service.restoreLeaveType(user.tenantId, id);
  }

  @Put('leave-types/:id')
  @Patch('leave-types/:id')
  updateLeaveType(
    @CurrentUser() user: RequestUser,
    @Param('id') id: string,
    @Body() body: { name?: string; status?: string },
  ) {
    return this.service.updateLeaveType(user.tenantId, id, body);
  }

  @Delete('leave-types/:id')
  removeLeaveType(
    @CurrentUser() user: RequestUser,
    @Param('id') id: string,
  ) {
    return this.service.removeLeaveType(user.tenantId, id);
  }

  @Get()
  root(@CurrentUser() user: RequestUser) {
    return this.service.list(user.tenantId);
  }

  @Get('trashed')
  listTrashed(@CurrentUser() user: RequestUser) {
    return this.service.listTrashed(user.tenantId);
  }

  @Post()
  create(
    @CurrentUser() user: RequestUser,
    @Body() body: { key?: string; value?: string; status?: string },
  ) {
    return this.service.create(user.tenantId, body);
  }

  @Patch(':id/soft-delete')
  softDelete(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    return this.service.softDelete(user.tenantId, id);
  }

  @Patch(':id/restore')
  restore(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    return this.service.restore(user.tenantId, id);
  }

  @Get(':id')
  get(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    return this.service.get(user.tenantId, id);
  }

  @Put()
  update(
    @CurrentUser() user: RequestUser,
    @Body() body: Record<string, string>,
  ) {
    return this.service.update(user.tenantId, body);
  }

  @Delete(':id')
  remove(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    return this.service.remove(user.tenantId, id);
  }
}
