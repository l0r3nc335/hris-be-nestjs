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
import { EmployeesService } from './employees.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { RequestUser } from '../../common/types/request-user';

@ApiTags('employees')
@Controller('employees')
@Permissions('employees:read')
export class EmployeesController {
  constructor(private readonly service: EmployeesService) {}

  @Get('active')
  active(@CurrentUser() user: RequestUser) {
    return this.service.active(user.tenantId);
  }

  @Get('resigned')
  resigned(@CurrentUser() user: RequestUser) {
    return this.service.resigned(user.tenantId);
  }

  @Get('by-department/:departmentId')
  byDepartment(
    @CurrentUser() user: RequestUser,
    @Param('departmentId') departmentId: string,
  ) {
    return this.service.byDepartment(user.tenantId, departmentId);
  }

  @Get('by-manager/:managerId')
  byManager(
    @CurrentUser() user: RequestUser,
    @Param('managerId') managerId: string,
  ) {
    return this.service.byManager(user.tenantId, managerId);
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

  @Get(':id/employment-history')
  employmentHistory(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    return this.service.employmentHistory(user.tenantId, id);
  }

  @Post(':id/promote')
  @Permissions('employees:write')
  promote(
    @CurrentUser() user: RequestUser,
    @Param('id') id: string,
    @Body() body: Record<string, string>,
  ) {
    return this.service.promote(user.tenantId, id, body);
  }

  @Post(':id/transfer')
  @Permissions('employees:write')
  transfer(
    @CurrentUser() user: RequestUser,
    @Param('id') id: string,
    @Body() body: Record<string, string>,
  ) {
    return this.service.transfer(user.tenantId, id, body);
  }

  @Get(':id')
  get(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    return this.service.get(user.tenantId, id);
  }

  @Post()
  @Permissions('employees:write')
  create(
    @CurrentUser() user: RequestUser,
    @Body() body: Record<string, string>,
  ) {
    return this.service.create(user.tenantId, body);
  }

  @Put(':id')
  @Permissions('employees:write')
  update(
    @CurrentUser() user: RequestUser,
    @Param('id') id: string,
    @Body() body: Record<string, string>,
  ) {
    return this.service.update(user.tenantId, id, body);
  }

  @Patch(':id')
  @Permissions('employees:write')
  patch(
    @CurrentUser() user: RequestUser,
    @Param('id') id: string,
    @Body() body: Record<string, string>,
  ) {
    return this.service.update(user.tenantId, id, body);
  }

  @Patch(':id/deactivate')
  @Permissions('employees:write')
  deactivate(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    return this.service.deactivate(user.tenantId, id);
  }

  @Delete(':id')
  @Permissions('employees:write')
  remove(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    return this.service.remove(user.tenantId, id);
  }
}
