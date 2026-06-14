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
import { RolesService } from './roles.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { RequestUser } from '../../common/types/request-user';

@ApiTags('roles')
@Controller()
@Permissions('roles:manage')
export class RolesController {
  constructor(private readonly service: RolesService) {}

  @Get('permissions')
  permissions() {
    return this.service.listPermissions();
  }

  @Get('roles')
  list(@CurrentUser() user: RequestUser) {
    return this.service.list(user.tenantId);
  }

  @Get('roles/trashed')
  listTrashed(@CurrentUser() user: RequestUser) {
    return this.service.listTrashed(user.tenantId);
  }

  @Post('roles')
  create(
    @CurrentUser() user: RequestUser,
    @Body() body: { name: string; slug?: string },
  ) {
    return this.service.create(user.tenantId, body);
  }

  @Get('roles/:id/permissions')
  rolePermissions(@Param('id') id: string) {
    return this.service.rolePermissions(id);
  }

  @Post('roles/:id/permissions')
  assignPermissions(
    @Param('id') id: string,
    @Body() body: { permissionIds: string[] },
  ) {
    return this.service.assignPermissions(id, body.permissionIds);
  }

  @Patch('roles/:id/soft-delete')
  softDelete(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    return this.service.softDelete(user.tenantId, id);
  }

  @Patch('roles/:id/restore')
  restore(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    return this.service.restore(user.tenantId, id);
  }

  @Get('roles/:id')
  get(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    return this.service.get(user.tenantId, id);
  }

  @Put('roles/:id')
  update(
    @CurrentUser() user: RequestUser,
    @Param('id') id: string,
    @Body() body: { name?: string },
  ) {
    return this.service.update(user.tenantId, id, body);
  }

  @Delete('roles/:id')
  remove(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    return this.service.remove(user.tenantId, id);
  }
}
