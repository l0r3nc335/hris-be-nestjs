import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { CompensationService } from './compensation.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { RequestUser } from '../../common/types/request-user';

@ApiTags('compensation')
@Controller()
@Permissions('payroll:read')
export class CompensationController {
  constructor(private readonly service: CompensationService) {}

  @Get('compensation')
  list(@CurrentUser() user: RequestUser, @Query() query: PaginationQueryDto) {
    return this.service.list(user.tenantId, query);
  }

  @Get('compensation/trashed')
  listTrashed(@CurrentUser() user: RequestUser, @Query() query: PaginationQueryDto) {
    return this.service.listTrashed(user.tenantId, query);
  }

  @Post('compensation')
  @Permissions('payroll:run')
  create(
    @CurrentUser() user: RequestUser,
    @Body() body: Record<string, string>,
  ) {
    return this.service.create(user.tenantId, body);
  }

  @Patch('compensation/:id/soft-delete')
  @Permissions('payroll:run')
  softDelete(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    return this.service.softDelete(user.tenantId, id);
  }

  @Patch('compensation/:id/restore')
  @Permissions('payroll:run')
  restore(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    return this.service.restore(user.tenantId, id);
  }

  @Get('compensation/:employeeId')
  byEmployee(
    @CurrentUser() user: RequestUser,
    @Param('employeeId') employeeId: string,
  ) {
    return this.service.byEmployee(user.tenantId, employeeId);
  }

  @Put('compensation/:employeeId')
  @Permissions('payroll:run')
  updateCompensation(
    @CurrentUser() user: RequestUser,
    @Param('employeeId') employeeId: string,
    @Body() body: Record<string, unknown>,
  ) {
    void body;
    return this.service.byEmployee(user.tenantId, employeeId);
  }

  @Post('compensation/:employeeId/adjust')
  @Permissions('payroll:run')
  adjust(
    @CurrentUser() user: RequestUser,
    @Param('employeeId') employeeId: string,
    @Body() body: Record<string, unknown>,
  ) {
    return this.service.adjust(user.tenantId, employeeId, body);
  }

  @Delete('compensation/:id')
  @Permissions('payroll:run')
  remove(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    return this.service.removeById(user.tenantId, id);
  }

  @Get('salary-structures')
  salaryStructures(@CurrentUser() user: RequestUser, @Query() query: PaginationQueryDto) {
    return this.service.salaryStructures(user.tenantId, query);
  }

  @Get('salary-structures/trashed')
  listTrashedStructures(@CurrentUser() user: RequestUser, @Query() query: PaginationQueryDto) {
    return this.service.listTrashedStructures(user.tenantId, query);
  }

  @Post('salary-structures')
  @Permissions('payroll:run')
  createStructure(
    @CurrentUser() user: RequestUser,
    @Body() body: Record<string, string>,
  ) {
    return this.service.createStructure(user.tenantId, body);
  }

  @Patch('salary-structures/:id/soft-delete')
  @Permissions('payroll:run')
  softDeleteStructure(
    @CurrentUser() user: RequestUser,
    @Param('id') id: string,
  ) {
    return this.service.softDeleteStructure(user.tenantId, id);
  }

  @Patch('salary-structures/:id/restore')
  @Permissions('payroll:run')
  restoreStructure(
    @CurrentUser() user: RequestUser,
    @Param('id') id: string,
  ) {
    return this.service.restoreStructure(user.tenantId, id);
  }

  @Get('salary-structures/:id')
  getStructure(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    return this.service.getStructure(user.tenantId, id);
  }

  @Put('salary-structures/:id')
  @Patch('salary-structures/:id')
  @Permissions('payroll:run')
  updateStructure(
    @CurrentUser() user: RequestUser,
    @Param('id') id: string,
    @Body() body: Record<string, string>,
  ) {
    return this.service.updateStructure(user.tenantId, id, body);
  }

  @Delete('salary-structures/:id')
  @Permissions('payroll:run')
  removeStructure(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    return this.service.removeStructure(user.tenantId, id);
  }
}
