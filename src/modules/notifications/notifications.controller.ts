import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
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
  markRead(@Body() body: { ids?: string[] }) {
    return this.service.markRead('', body.ids ?? []);
  }

  @Post('mark-all-read')
  markAllRead(@CurrentUser() user: RequestUser) {
    return this.service.markAllRead(user.tenantId);
  }

  @Get()
  list(@CurrentUser() user: RequestUser) {
    return this.service.list(user.tenantId);
  }

  @Get(':id')
  get(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    return this.service.get(user.tenantId, id);
  }

  @Delete(':id')
  remove(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    return this.service.remove(user.tenantId, id);
  }
}
