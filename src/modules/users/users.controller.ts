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
import { UsersService } from './users.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { RequestUser } from '../../common/types/request-user';

@ApiTags('users')
@Controller('users')
@Permissions('users:read')
export class UsersController {
  constructor(private readonly service: UsersService) {}

  @Get()
  list(@CurrentUser() user: RequestUser) {
    return this.service.list(user.tenantId);
  }

  @Get('search')
  search(@CurrentUser() user: RequestUser, @Query('q') q?: string) {
    return this.service.search(user.tenantId, q);
  }

  @Get('active')
  active(@CurrentUser() user: RequestUser) {
    return this.service.active(user.tenantId);
  }

  @Get('inactive')
  inactive(@CurrentUser() user: RequestUser) {
    return this.service.inactive(user.tenantId);
  }

  @Get(':id/profile')
  profile(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    return this.service.getProfile(user.tenantId, id);
  }

  @Get(':id')
  get(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    return this.service.get(user.tenantId, id);
  }

  @Post()
  @Permissions('users:write')
  create(
    @CurrentUser() user: RequestUser,
    @Body() body: Record<string, string>,
  ) {
    return this.service.create(user.tenantId, body);
  }

  @Put(':id')
  @Permissions('users:write')
  update(
    @CurrentUser() user: RequestUser,
    @Param('id') id: string,
    @Body() body: Record<string, string>,
  ) {
    return this.service.update(user.tenantId, id, body);
  }

  @Patch(':id')
  @Permissions('users:write')
  patch(
    @CurrentUser() user: RequestUser,
    @Param('id') id: string,
    @Body() body: Record<string, string>,
  ) {
    return this.service.update(user.tenantId, id, body);
  }

  @Patch(':id/deactivate')
  @Permissions('users:write')
  deactivate(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    return this.service.deactivate(user.tenantId, id);
  }

  @Patch(':id/reactivate')
  @Permissions('users:write')
  reactivate(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    return this.service.reactivate(user.tenantId, id);
  }

  @Delete(':id')
  @Permissions('users:write')
  remove(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    return this.service.remove(user.tenantId, id);
  }
}
