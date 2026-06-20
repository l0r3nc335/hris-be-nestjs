import { Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { MessagesService } from './messages.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { RequestUser } from '../../common/types/request-user';

@ApiTags('messages')
@Controller('messages')
@Permissions('messages:read')
export class MessagesController {
  constructor(private readonly service: MessagesService) {}

  @Get('inbox')
  inbox(@CurrentUser() user: RequestUser) {
    return this.service.inbox(user.tenantId, user.id);
  }

  @Patch(':id/read')
  markRead(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    return this.service.markRead(user.tenantId, user.id, id);
  }

  @Post('mark-all-read')
  markAllRead(@CurrentUser() user: RequestUser) {
    return this.service.markAllRead(user.tenantId, user.id);
  }
}
