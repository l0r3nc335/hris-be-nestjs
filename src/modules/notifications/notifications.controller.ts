import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { RequestUser } from '../../common/types/request-user';

@ApiTags('notifications')
@Controller('notifications')
@Permissions('employees:read')
export class NotificationsController {
  constructor(private readonly service: NotificationsService) {}

  @Post('mark-read')
  @Permissions('employees:write')
  markRead(
    @CurrentUser() user: RequestUser,
    @Body() body: { ids?: string[] },
  ) {
    return this.service.markRead(user.tenantId, body.ids ?? []);
  }

  @Post('mark-all-read')
  @Permissions('employees:write')
  markAllRead(@CurrentUser() user: RequestUser) {
    return this.service.markAllRead(user.tenantId);
  }

  @Post()
  @Permissions('employees:write')
  create(
    @CurrentUser() user: RequestUser,
    @Body() body: Record<string, string>,
  ) {
    return this.service.create(user.tenantId, body);
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

  @Get(':id')
  get(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    return this.service.get(user.tenantId, id);
  }

  @Delete(':id')
  @Permissions('employees:write')
  remove(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    return this.service.remove(user.tenantId, id);
  }
}
