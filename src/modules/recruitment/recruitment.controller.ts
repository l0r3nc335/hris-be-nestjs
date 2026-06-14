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
import { RecruitmentService } from './recruitment.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { RequestUser } from '../../common/types/request-user';

@ApiTags('recruitment')
@Controller('recruitment')
@Permissions('employees:read')
export class RecruitmentController {
  constructor(private readonly service: RecruitmentService) {}

  @Get('jobs')
  listJobs(@CurrentUser() user: RequestUser) {
    return this.service.listJobs(user.tenantId);
  }

  @Get('jobs/trashed')
  listTrashedJobs(@CurrentUser() user: RequestUser) {
    return this.service.listTrashedJobs(user.tenantId);
  }

  @Post('jobs')
  @Permissions('employees:write')
  createJob(
    @CurrentUser() user: RequestUser,
    @Body() body: Record<string, string>,
  ) {
    return this.service.createJob(user.tenantId, body);
  }

  @Patch('jobs/:id/soft-delete')
  @Permissions('employees:write')
  softDeleteJob(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    return this.service.softDeleteJob(user.tenantId, id);
  }

  @Patch('jobs/:id/restore')
  @Permissions('employees:write')
  restoreJob(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    return this.service.restoreJob(user.tenantId, id);
  }

  @Get('jobs/:id')
  getJob(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    return this.service.getJob(user.tenantId, id);
  }

  @Put('jobs/:id')
  @Patch('jobs/:id')
  @Permissions('employees:write')
  updateJob(
    @CurrentUser() user: RequestUser,
    @Param('id') id: string,
    @Body() body: Record<string, string>,
  ) {
    return this.service.updateJob(user.tenantId, id, body);
  }

  @Delete('jobs/:id')
  @Permissions('employees:write')
  removeJob(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    return this.service.removeJob(user.tenantId, id);
  }

  @Get('applicants')
  listApplicants(@CurrentUser() user: RequestUser) {
    return this.service.listApplicants(user.tenantId);
  }

  @Get('applicants/trashed')
  listTrashedApplicants(@CurrentUser() user: RequestUser) {
    return this.service.listTrashedApplicants(user.tenantId);
  }

  @Post('applicants')
  @Permissions('employees:write')
  createApplicant(
    @CurrentUser() user: RequestUser,
    @Body() body: Record<string, string>,
  ) {
    return this.service.createApplicant(user.tenantId, body);
  }

  @Patch('applicants/:id/soft-delete')
  @Permissions('employees:write')
  softDeleteApplicant(
    @CurrentUser() user: RequestUser,
    @Param('id') id: string,
  ) {
    return this.service.softDeleteApplicant(user.tenantId, id);
  }

  @Patch('applicants/:id/restore')
  @Permissions('employees:write')
  restoreApplicant(
    @CurrentUser() user: RequestUser,
    @Param('id') id: string,
  ) {
    return this.service.restoreApplicant(user.tenantId, id);
  }

  @Get('applicants/:id')
  getApplicant(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    return this.service.getApplicant(user.tenantId, id);
  }

  @Put('applicants/:id')
  @Patch('applicants/:id')
  @Permissions('employees:write')
  updateApplicant(
    @CurrentUser() user: RequestUser,
    @Param('id') id: string,
    @Body() body: Record<string, string>,
  ) {
    return this.service.updateApplicant(user.tenantId, id, body);
  }

  @Delete('applicants/:id')
  @Permissions('employees:write')
  removeApplicant(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    return this.service.removeApplicant(user.tenantId, id);
  }

  @Post('applicants/:id/schedule-interview')
  @Permissions('employees:write')
  scheduleInterview(
    @Param('id') id: string,
    @Body() body: Record<string, string>,
  ) {
    return this.service.scheduleInterview(id, body);
  }

  @Post('applicants/:id/hire')
  @Permissions('employees:write')
  hire(@Param('id') id: string) {
    return this.service.hire(id);
  }

  @Post('applicants/:id/reject')
  @Permissions('employees:write')
  reject(@Param('id') id: string) {
    return this.service.reject(id);
  }
}
