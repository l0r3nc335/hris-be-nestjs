import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { CompensationService } from './compensation.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { ctxFromUser } from '../../common/helpers/tenant-context.helper';
import { RequestUser } from '../../common/types/request-user';

@ApiTags('compensation')
@Controller()
@Permissions('payroll:read')
export class CompensationController {
  constructor(private readonly service: CompensationService) {}

  @Get('compensation')
  list(@CurrentUser() user: RequestUser, @Query() query: PaginationQueryDto) {
    return this.service.list(ctxFromUser(user), query);
  }

  @Get('compensation/trashed')
  listTrashed(@CurrentUser() user: RequestUser, @Query() query: PaginationQueryDto) {
    return this.service.listTrashed(ctxFromUser(user), query);
  }

  @Post('compensation')
  @Permissions('payroll:run')
  create(
    @CurrentUser() user: RequestUser,
    @Body() body: Record<string, string>,
  ) {
    return this.service.create(ctxFromUser(user), body);
  }

  @Patch('compensation/:id/soft-delete')
  @Permissions('payroll:run')
  softDelete(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    return this.service.softDelete(ctxFromUser(user), id);
  }

  @Patch('compensation/:id/restore')
  @Permissions('payroll:run')
  restore(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    return this.service.restore(ctxFromUser(user), id);
  }

  @Get('compensation/:employeeId')
  byEmployee(
    @CurrentUser() user: RequestUser,
    @Param('employeeId') employeeId: string,
  ) {
    return this.service.byEmployee(ctxFromUser(user), employeeId);
  }

  @Put('compensation/:employeeId')
  @Permissions('payroll:run')
  updateCompensation(
    @CurrentUser() user: RequestUser,
    @Param('employeeId') employeeId: string,
    @Body() body: Record<string, unknown>,
  ) {
    void body;
    return this.service.byEmployee(ctxFromUser(user), employeeId);
  }

  @Post('compensation/:employeeId/adjust')
  @Permissions('payroll:run')
  adjust(
    @CurrentUser() user: RequestUser,
    @Param('employeeId') employeeId: string,
    @Body() body: Record<string, unknown>,
  ) {
    return this.service.adjust(ctxFromUser(user), employeeId, body);
  }

  @Delete('compensation/:id')
  @Permissions('payroll:run')
  remove(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    return this.service.removeById(ctxFromUser(user), id);
  }

  @Get('salary-structures')
  salaryStructures(@CurrentUser() user: RequestUser, @Query() query: PaginationQueryDto) {
    return this.service.salaryStructures(ctxFromUser(user), query);
  }

  @Get('salary-structures/trashed')
  listTrashedStructures(@CurrentUser() user: RequestUser, @Query() query: PaginationQueryDto) {
    return this.service.listTrashedStructures(ctxFromUser(user), query);
  }

  @Post('salary-structures')
  @Permissions('payroll:run')
  createStructure(
    @CurrentUser() user: RequestUser,
    @Body() body: Record<string, string>,
  ) {
    return this.service.createStructure(ctxFromUser(user), body);
  }

  @Patch('salary-structures/:id/soft-delete')
  @Permissions('payroll:run')
  softDeleteStructure(
    @CurrentUser() user: RequestUser,
    @Param('id') id: string,
  ) {
    return this.service.softDeleteStructure(ctxFromUser(user), id);
  }

  @Patch('salary-structures/:id/restore')
  @Permissions('payroll:run')
  restoreStructure(
    @CurrentUser() user: RequestUser,
    @Param('id') id: string,
  ) {
    return this.service.restoreStructure(ctxFromUser(user), id);
  }

  @Get('salary-structures/:id')
  getStructure(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    return this.service.getStructure(ctxFromUser(user), id);
  }

  @Put('salary-structures/:id')
  @Patch('salary-structures/:id')
  @Permissions('payroll:run')
  updateStructure(
    @CurrentUser() user: RequestUser,
    @Param('id') id: string,
    @Body() body: Record<string, string>,
  ) {
    return this.service.updateStructure(ctxFromUser(user), id, body);
  }

  @Delete('salary-structures/:id')
  @Permissions('payroll:run')
  removeStructure(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    return this.service.removeStructure(ctxFromUser(user), id);
  }
}
