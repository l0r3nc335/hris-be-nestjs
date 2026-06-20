import { Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
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
  list(@CurrentUser() user: RequestUser, @Query() query: PaginationQueryDto) {
    return this.service.list(user.tenantId, query);
  }

  @Get('roles/trashed')
  listTrashed(@CurrentUser() user: RequestUser, @Query() query: PaginationQueryDto) {
    return this.service.listTrashed(user.tenantId, query);
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
