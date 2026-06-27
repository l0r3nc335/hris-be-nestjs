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
import { UsersService } from './users.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { ctxFromUser } from '../../common/helpers/tenant-context.helper';
import { RequestUser } from '../../common/types/request-user';

@ApiTags('users')
@Controller('users')
@Permissions('users:read')
export class UsersController {
  constructor(private readonly service: UsersService) {}

  @Get()
  list(@CurrentUser() user: RequestUser, @Query() query: PaginationQueryDto) {
    return this.service.list(ctxFromUser(user), query);
  }

  @Get('search')
  search(@CurrentUser() user: RequestUser, @Query('q') q?: string) {
    return this.service.search(ctxFromUser(user), q);
  }

  @Get('active')
  active(@CurrentUser() user: RequestUser) {
    return this.service.active(ctxFromUser(user));
  }

  @Get('inactive')
  inactive(@CurrentUser() user: RequestUser) {
    return this.service.inactive(ctxFromUser(user));
  }

  @Get('trashed')
  listTrashed(@CurrentUser() user: RequestUser, @Query() query: PaginationQueryDto) {
    return this.service.listTrashed(ctxFromUser(user), query);
  }

  @Patch(':id/soft-delete')
  @Permissions('users:write')
  softDelete(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    return this.service.softDelete(ctxFromUser(user), id);
  }

  @Patch(':id/restore')
  @Permissions('users:write')
  restore(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    return this.service.restore(ctxFromUser(user), id);
  }

  @Get(':id/profile')
  profile(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    return this.service.getProfile(ctxFromUser(user), id);
  }

  @Get(':id')
  get(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    return this.service.get(ctxFromUser(user), id);
  }

  @Post()
  @Permissions('users:write')
  create(
    @CurrentUser() user: RequestUser,
    @Body() body: Record<string, string>,
  ) {
    return this.service.create(ctxFromUser(user), body);
  }

  @Put(':id')
  @Permissions('users:write')
  update(
    @CurrentUser() user: RequestUser,
    @Param('id') id: string,
    @Body() body: Record<string, string>,
  ) {
    return this.service.update(ctxFromUser(user), id, body);
  }

  @Patch(':id')
  @Permissions('users:write')
  patch(
    @CurrentUser() user: RequestUser,
    @Param('id') id: string,
    @Body() body: Record<string, string>,
  ) {
    return this.service.update(ctxFromUser(user), id, body);
  }

  @Patch(':id/deactivate')
  @Permissions('users:write')
  deactivate(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    return this.service.deactivate(ctxFromUser(user), id);
  }

  @Patch(':id/reactivate')
  @Permissions('users:write')
  reactivate(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    return this.service.reactivate(ctxFromUser(user), id);
  }

  @Delete(':id')
  @Permissions('users:write')
  remove(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    return this.service.remove(ctxFromUser(user), id);
  }

  @Get(':id/roles')
  @Permissions('roles:manage')
  userRoles(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    return this.service.getUserRoles(ctxFromUser(user), id);
  }

  @Patch(':id/roles')
  @Permissions('roles:manage')
  setUserRoles(
    @CurrentUser() user: RequestUser,
    @Param('id') id: string,
    @Body() body: { roleIds: string[] },
  ) {
    return this.service.setUserRoles(user, ctxFromUser(user), id, body.roleIds ?? []);
  }
}
