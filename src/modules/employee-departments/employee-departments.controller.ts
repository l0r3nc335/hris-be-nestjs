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
import { EmployeeDepartmentsService } from './employee-departments.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { RequestUser } from '../../common/types/request-user';

@ApiTags('employee-departments')
@Controller('employee-departments')
@Permissions('employee-departments:read')
export class EmployeeDepartmentsController {
  constructor(private readonly service: EmployeeDepartmentsService) {}

  @Get()
  list(@CurrentUser() user: RequestUser, @Query() query: PaginationQueryDto) {
    return this.service.list(user.tenantId, query);
  }

  @Get('trashed')
  listTrashed(@CurrentUser() user: RequestUser, @Query() query: PaginationQueryDto) {
    return this.service.listTrashed(user.tenantId, query);
  }

  @Patch(':id/soft-delete')
  @Permissions('employee-departments:write')
  softDelete(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    return this.service.softDelete(user.tenantId, id);
  }

  @Patch(':id/restore')
  @Permissions('employee-departments:write')
  restore(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    return this.service.restore(user.tenantId, id);
  }

  @Get(':id')
  get(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    return this.service.get(user.tenantId, id);
  }

  @Post()
  @Permissions('employee-departments:write')
  create(@CurrentUser() user: RequestUser, @Body() body: Record<string, string>) {
    return this.service.create(user.tenantId, body);
  }

  @Put(':id')
  @Permissions('employee-departments:write')
  updatePut(
    @CurrentUser() user: RequestUser,
    @Param('id') id: string,
    @Body() body: Record<string, string>,
  ) {
    return this.service.update(user.tenantId, id, body);
  }

  @Patch(':id')
  @Permissions('employee-departments:write')
  updatePatch(
    @CurrentUser() user: RequestUser,
    @Param('id') id: string,
    @Body() body: Record<string, string>,
  ) {
    return this.service.update(user.tenantId, id, body);
  }

  @Delete(':id')
  @Permissions('employee-departments:write')
  remove(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    return this.service.remove(user.tenantId, id);
  }
}
