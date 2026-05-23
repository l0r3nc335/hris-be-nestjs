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
import { LeaveService } from './leave.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Permissions } from '../../common/decorators/permissions.decorator';
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
    return this.service.apply(user.tenantId, body);
  }

  @Get('pending')
  pending(@CurrentUser() user: RequestUser) {
    return this.service.pending(user.tenantId);
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
    return this.service.history(user.tenantId, employeeId);
  }

  @Get()
  list(@CurrentUser() user: RequestUser) {
    return this.service.list(user.tenantId);
  }

  @Patch(':id/approve')
  @Permissions('leave:approve')
  approve(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    return this.service.approve(user.tenantId, id);
  }

  @Patch(':id/reject')
  @Permissions('leave:approve')
  reject(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    return this.service.reject(user.tenantId, id);
  }

  @Patch(':id/cancel')
  cancel(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    return this.service.cancel(user.tenantId, id);
  }

  @Get(':id')
  get(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    return this.service.get(user.tenantId, id);
  }

  @Post()
  create(
    @CurrentUser() user: RequestUser,
    @Body() body: Record<string, string>,
  ) {
    return this.service.create(user.tenantId, body);
  }

  @Put(':id')
  @Patch(':id')
  update(
    @CurrentUser() user: RequestUser,
    @Param('id') id: string,
    @Body() body: Record<string, string>,
  ) {
    return this.service.update(user.tenantId, id, body);
  }

  @Delete(':id')
  remove(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    return this.service.remove(user.tenantId, id);
  }
}
