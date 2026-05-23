import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { HrRecordsService } from '../../common/services/hr-records.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { RequestUser } from '../../common/types/request-user';

@ApiTags('settings')
@Controller('settings')
@Permissions('settings:write')
export class SettingsController {
  constructor(private readonly hr: HrRecordsService) {}

  @Get('company')
  company() {
    return { companyName: 'Acme HRIS' };
  }

  @Put('company')
  updateCompany(@Body() body: Record<string, string>) {
    return { companyName: body.companyName ?? 'Acme HRIS', ...body };
  }

  @Get('leave-types')
  leaveTypes(@CurrentUser() user: RequestUser) {
    return this.hr.list(user.tenantId, 'leave-types');
  }

  @Post('leave-types')
  createLeaveType(
    @CurrentUser() user: RequestUser,
    @Body() body: { name?: string },
  ) {
    return this.hr.createStub(
      user.tenantId,
      'leave-types',
      body.name ?? 'LeaveType',
    );
  }

  @Get()
  root() {
    return { companyName: 'Acme HRIS' };
  }

  @Get(':id')
  get(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    return this.hr.getById(user.tenantId, 'settings', id).catch(() => ({
      id,
      companyName: 'Acme HRIS',
    }));
  }

  @Put()
  update(@Body() body: Record<string, string>) {
    return { ...body, updated: true };
  }
}
