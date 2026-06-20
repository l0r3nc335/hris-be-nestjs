import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { OrganizationService } from './organization.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { RequestUser } from '../../common/types/request-user';

@ApiTags('organization')
@Controller('org')
@Permissions('employees:read')
export class OrganizationController {
  constructor(private readonly service: OrganizationService) {}

  @Get('chart')
  chart(@CurrentUser() user: RequestUser) {
    return this.service.chart(user.tenantId);
  }

  @Get('chart/trashed')
  listTrashed(
    @CurrentUser() user: RequestUser,
    @Query() query: PaginationQueryDto,
  ) {
    return this.service.listTrashed(user.tenantId, query);
  }

  @Patch('chart/:id/soft-delete')
  @Permissions('employees:write')
  softDelete(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    return this.service.softDelete(user.tenantId, id);
  }

  @Patch('chart/:id/restore')
  @Permissions('employees:write')
  restore(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    return this.service.restore(user.tenantId, id);
  }

  @Get('reporting-lines')
  reportingLines(@CurrentUser() user: RequestUser) {
    return this.service.reportingLines(user.tenantId);
  }

  @Get('positions-tree')
  positionsTree(@CurrentUser() user: RequestUser) {
    return this.service.positionsTree(user.tenantId);
  }

  @Get('chart/:id')
  getNode(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    return this.service.getChartNode(user.tenantId, id);
  }

  @Post('chart')
  @Permissions('employees:write')
  create(
    @CurrentUser() user: RequestUser,
    @Body() body: Record<string, string>,
  ) {
    return this.service.create(user.tenantId, body);
  }

  @Patch('chart/:id')
  @Permissions('employees:write')
  update(
    @CurrentUser() user: RequestUser,
    @Param('id') id: string,
    @Body() body: Record<string, string>,
  ) {
    return this.service.update(user.tenantId, id, body);
  }

  @Delete('chart/:id')
  @Permissions('employees:write')
  remove(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    return this.service.remove(user.tenantId, id);
  }
}
