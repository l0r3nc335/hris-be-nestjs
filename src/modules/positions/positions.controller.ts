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
import { PositionsService } from './positions.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { RequestUser } from '../../common/types/request-user';

@ApiTags('positions')
@Controller('positions')
@Permissions('departments:read')
export class PositionsController {
  constructor(private readonly service: PositionsService) {}

  @Get()
  list(@CurrentUser() user: RequestUser) {
    return this.service.list(user.tenantId);
  }

  @Get('trashed')
  listTrashed(@CurrentUser() user: RequestUser) {
    return this.service.listTrashed(user.tenantId);
  }

  @Patch(':id/soft-delete')
  @Permissions('departments:write')
  softDelete(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    return this.service.softDelete(user.tenantId, id);
  }

  @Patch(':id/restore')
  @Permissions('departments:write')
  restore(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    return this.service.restore(user.tenantId, id);
  }

  @Get(':id')
  get(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    return this.service.get(user.tenantId, id);
  }

  @Post()
  @Permissions('departments:write')
  create(
    @CurrentUser() user: RequestUser,
    @Body() body: Record<string, string>,
  ) {
    return this.service.create(user.tenantId, body);
  }

  @Put(':id')
  @Permissions('departments:write')
  update(
    @CurrentUser() user: RequestUser,
    @Param('id') id: string,
    @Body() body: Record<string, string>,
  ) {
    return this.service.update(user.tenantId, id, body);
  }

  @Patch(':id')
  @Permissions('departments:write')
  patch(
    @CurrentUser() user: RequestUser,
    @Param('id') id: string,
    @Body() body: Record<string, string>,
  ) {
    return this.service.update(user.tenantId, id, body);
  }

  @Delete(':id')
  @Permissions('departments:write')
  remove(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    return this.service.remove(user.tenantId, id);
  }
}
