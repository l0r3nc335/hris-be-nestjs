import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
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
}
