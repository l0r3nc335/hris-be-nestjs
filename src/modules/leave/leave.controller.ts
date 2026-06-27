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
import { LeaveService } from './leave.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { ctxFromUser } from '../../common/helpers/tenant-context.helper';
import { RequestUser } from '../../common/types/request-user';

@ApiTags('leave')
@Controller('leaves')
@Permissions('employees:read')
export class LeaveController {
  constructor(private readonly service: LeaveService) {}

  @Post('apply')
  apply(
    @CurrentUser() user: RequestUser,
    @Body() body: Record<string, string>,
  ) {
    return this.service.apply(ctxFromUser(user), body);
  }

  @Get('pending')
  pending(@CurrentUser() user: RequestUser) {
    return this.service.pending(ctxFromUser(user));
  }

  @Get('balance/:employeeId')
  balance(@Param('employeeId') employeeId: string) {
    return this.service.balance('', employeeId);
  }

  @Get('history/:employeeId')
  history(
    @CurrentUser() user: RequestUser,
    @Param('employeeId') employeeId: string,
  ) {
    return this.service.history(ctxFromUser(user), employeeId);
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

  @Patch(':id/approve')
  @Permissions('leave:approve')
  approve(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    return this.service.approve(ctxFromUser(user), id);
  }

  @Patch(':id/reject')
  @Permissions('leave:approve')
  reject(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    return this.service.reject(ctxFromUser(user), id);
  }

  @Patch(':id/cancel')
  cancel(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    return this.service.cancel(ctxFromUser(user), id);
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
  @Patch(':id')
  @Permissions('employees:write')
  update(
    @CurrentUser() user: RequestUser,
    @Param('id') id: string,
    @Body() body: Record<string, string>,
  ) {
    return this.service.update(ctxFromUser(user), id, body);
  }

  @Delete(':id')
  @Permissions('employees:write')
  remove(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    return this.service.remove(ctxFromUser(user), id);
  }
}
