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
import { EmployeesService } from './employees.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { ctxFromUser } from '../../common/helpers/tenant-context.helper';
import { RequestUser } from '../../common/types/request-user';

@ApiTags('employees')
@Controller('employees')
@Permissions('employees:read')
export class EmployeesController {
  constructor(private readonly service: EmployeesService) {}

  @Get('active')
  active(@CurrentUser() user: RequestUser) {
    return this.service.active(ctxFromUser(user));
  }

  @Get('resigned')
  resigned(@CurrentUser() user: RequestUser) {
    return this.service.resigned(ctxFromUser(user));
  }

  @Get('by-department/:departmentId')
  byDepartment(
    @CurrentUser() user: RequestUser,
    @Param('departmentId') departmentId: string,
  ) {
    return this.service.byDepartment(ctxFromUser(user), departmentId);
  }

  @Get('by-manager/:managerId')
  byManager(
    @CurrentUser() user: RequestUser,
    @Param('managerId') managerId: string,
  ) {
    return this.service.byManager(ctxFromUser(user), managerId);
  }

  @Get()
  list(@CurrentUser() user: RequestUser, @Query() query: PaginationQueryDto) {
    return this.service.list(ctxFromUser(user), query);
  }

  @Get('trashed')
  listTrashed(@CurrentUser() user: RequestUser, @Query() query: PaginationQueryDto) {
    return this.service.listTrashed(ctxFromUser(user), query);
  }

  @Patch(':id/soft-delete')
  @Permissions('employees:write')
  softDelete(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    return this.service.softDelete(ctxFromUser(user), id);
  }

  @Patch(':id/restore')
  @Permissions('employees:write')
  restore(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    return this.service.restore(ctxFromUser(user), id);
  }

  @Get(':id/employment-history')
  employmentHistory(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    return this.service.employmentHistory(ctxFromUser(user), id);
  }

  @Post(':id/promote')
  @Permissions('employees:write')
  promote(
    @CurrentUser() user: RequestUser,
    @Param('id') id: string,
    @Body() body: Record<string, string>,
  ) {
    return this.service.promote(ctxFromUser(user), id, body);
  }

  @Post(':id/transfer')
  @Permissions('employees:write')
  transfer(
    @CurrentUser() user: RequestUser,
    @Param('id') id: string,
    @Body() body: Record<string, string>,
  ) {
    return this.service.transfer(ctxFromUser(user), id, body);
  }

  @Get(':id')
  get(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    return this.service.get(ctxFromUser(user), id);
  }

  @Post()
  @Permissions('employees:write')
  create(
    @CurrentUser() user: RequestUser,
    @Body() body: Record<string, string>,
  ) {
    return this.service.create(ctxFromUser(user), body);
  }

  @Put(':id')
  @Permissions('employees:write')
  update(
    @CurrentUser() user: RequestUser,
    @Param('id') id: string,
    @Body() body: Record<string, string>,
  ) {
    return this.service.update(ctxFromUser(user), id, body);
  }

  @Patch(':id')
  @Permissions('employees:write')
  patch(
    @CurrentUser() user: RequestUser,
    @Param('id') id: string,
    @Body() body: Record<string, string>,
  ) {
    return this.service.update(ctxFromUser(user), id, body);
  }

  @Patch(':id/deactivate')
  @Permissions('employees:write')
  deactivate(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    return this.service.deactivate(ctxFromUser(user), id);
  }

  @Delete(':id')
  @Permissions('employees:write')
  remove(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    return this.service.remove(ctxFromUser(user), id);
  }
}
