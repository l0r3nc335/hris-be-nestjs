import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuditService } from './audit.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { RequestUser } from '../../common/types/request-user';

@ApiTags('audit')
@Controller('audit-logs')
@Permissions('audit:read')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  list(@CurrentUser() user: RequestUser) {
    return this.auditService.list(user.tenantId);
  }

  @Get('user/:userId')
  byUser(@CurrentUser() user: RequestUser, @Param('userId') userId: string) {
    return this.auditService.byUser(user.tenantId, userId);
  }

  @Get(':entity/:id')
  byEntity(
    @CurrentUser() user: RequestUser,
    @Param('entity') entity: string,
    @Param('id') id: string,
  ) {
    return this.auditService.byEntity(user.tenantId, entity, id);
  }

  @Get(':id')
  getById(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    return this.auditService.getById(user.tenantId, id);
  }
}
