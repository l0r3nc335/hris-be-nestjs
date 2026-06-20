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
import { PerformanceService } from './performance.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { RequestUser } from '../../common/types/request-user';

@ApiTags('performance')
@Controller('performance')
@Permissions('employees:read')
export class PerformanceController {
  constructor(private readonly service: PerformanceService) {}

  @Get('reviews')
  list(@CurrentUser() user: RequestUser, @Query() query: PaginationQueryDto) {
    return this.service.list(user.tenantId, query);
  }

  @Get('reviews/trashed')
  listTrashed(@CurrentUser() user: RequestUser, @Query() query: PaginationQueryDto) {
    return this.service.listTrashed(user.tenantId, query);
  }

  @Get('ratings/:employeeId')
  ratings(
    @CurrentUser() user: RequestUser,
    @Param('employeeId') employeeId: string,
  ) {
    return this.service.ratings(user.tenantId, employeeId);
  }

  @Post('reviews')
  @Permissions('employees:write')
  create(
    @CurrentUser() user: RequestUser,
    @Body() body: Record<string, string>,
  ) {
    return this.service.create(user.tenantId, body);
  }

  @Post('reviews/:id/submit')
  @Permissions('employees:write')
  submit(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    return this.service.submit(user.tenantId, id);
  }

  @Post('reviews/:id/approve')
  @Permissions('employees:write')
  approve(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    return this.service.approve(user.tenantId, id);
  }

  @Patch('reviews/:id/soft-delete')
  @Permissions('employees:write')
  softDelete(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    return this.service.softDelete(user.tenantId, id);
  }

  @Patch('reviews/:id/restore')
  @Permissions('employees:write')
  restore(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    return this.service.restore(user.tenantId, id);
  }

  @Get('reviews/:id')
  get(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    return this.service.get(user.tenantId, id);
  }

  @Put('reviews/:id')
  @Patch('reviews/:id')
  @Permissions('employees:write')
  update(
    @CurrentUser() user: RequestUser,
    @Param('id') id: string,
    @Body() body: Record<string, string>,
  ) {
    return this.service.update(user.tenantId, id, body);
  }

  @Delete('reviews/:id')
  @Permissions('employees:write')
  remove(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    return this.service.remove(user.tenantId, id);
  }
}
