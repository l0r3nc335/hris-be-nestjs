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
import { ctxFromUser } from '../../common/helpers/tenant-context.helper';
import { RequestUser } from '../../common/types/request-user';

@ApiTags('performance')
@Controller('performance')
@Permissions('employees:read')
export class PerformanceController {
  constructor(private readonly service: PerformanceService) {}

  @Get('reviews')
  list(@CurrentUser() user: RequestUser, @Query() query: PaginationQueryDto) {
    return this.service.list(ctxFromUser(user), query);
  }

  @Get('reviews/trashed')
  listTrashed(@CurrentUser() user: RequestUser, @Query() query: PaginationQueryDto) {
    return this.service.listTrashed(ctxFromUser(user), query);
  }

  @Get('ratings/:employeeId')
  ratings(
    @CurrentUser() user: RequestUser,
    @Param('employeeId') employeeId: string,
  ) {
    return this.service.ratings(ctxFromUser(user), employeeId);
  }

  @Post('reviews')
  @Permissions('employees:write')
  create(
    @CurrentUser() user: RequestUser,
    @Body() body: Record<string, string>,
  ) {
    return this.service.create(ctxFromUser(user), body);
  }

  @Post('reviews/:id/submit')
  @Permissions('employees:write')
  submit(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    return this.service.submit(ctxFromUser(user), id);
  }

  @Post('reviews/:id/approve')
  @Permissions('employees:write')
  approve(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    return this.service.approve(ctxFromUser(user), id);
  }

  @Patch('reviews/:id/soft-delete')
  @Permissions('employees:write')
  softDelete(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    return this.service.softDelete(ctxFromUser(user), id);
  }

  @Patch('reviews/:id/restore')
  @Permissions('employees:write')
  restore(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    return this.service.restore(ctxFromUser(user), id);
  }

  @Get('reviews/:id')
  get(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    return this.service.get(ctxFromUser(user), id);
  }

  @Put('reviews/:id')
  @Patch('reviews/:id')
  @Permissions('employees:write')
  update(
    @CurrentUser() user: RequestUser,
    @Param('id') id: string,
    @Body() body: Record<string, string>,
  ) {
    return this.service.update(ctxFromUser(user), id, body);
  }

  @Delete('reviews/:id')
  @Permissions('employees:write')
  remove(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    return this.service.remove(ctxFromUser(user), id);
  }
}
