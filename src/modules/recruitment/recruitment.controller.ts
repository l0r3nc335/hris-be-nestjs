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
import { RecruitmentService } from './recruitment.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { ctxFromUser } from '../../common/helpers/tenant-context.helper';
import { RequestUser } from '../../common/types/request-user';

@ApiTags('recruitment')
@Controller('recruitment')
@Permissions('employees:read')
export class RecruitmentController {
  constructor(private readonly service: RecruitmentService) {}

  @Get('jobs')
  listJobs(@CurrentUser() user: RequestUser, @Query() query: PaginationQueryDto) {
    return this.service.listJobs(ctxFromUser(user), query);
  }

  @Get('jobs/trashed')
  listTrashedJobs(@CurrentUser() user: RequestUser, @Query() query: PaginationQueryDto) {
    return this.service.listTrashedJobs(ctxFromUser(user), query);
  }

  @Post('jobs')
  @Permissions('employees:write')
  createJob(
    @CurrentUser() user: RequestUser,
    @Body() body: Record<string, string>,
  ) {
    return this.service.createJob(ctxFromUser(user), body);
  }

  @Patch('jobs/:id/soft-delete')
  @Permissions('employees:write')
  softDeleteJob(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    return this.service.softDeleteJob(ctxFromUser(user), id);
  }

  @Patch('jobs/:id/restore')
  @Permissions('employees:write')
  restoreJob(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    return this.service.restoreJob(ctxFromUser(user), id);
  }

  @Get('jobs/:id')
  getJob(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    return this.service.getJob(ctxFromUser(user), id);
  }

  @Put('jobs/:id')
  @Patch('jobs/:id')
  @Permissions('employees:write')
  updateJob(
    @CurrentUser() user: RequestUser,
    @Param('id') id: string,
    @Body() body: Record<string, string>,
  ) {
    return this.service.updateJob(ctxFromUser(user), id, body);
  }

  @Delete('jobs/:id')
  @Permissions('employees:write')
  removeJob(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    return this.service.removeJob(ctxFromUser(user), id);
  }

  @Get('applicants')
  listApplicants(@CurrentUser() user: RequestUser, @Query() query: PaginationQueryDto) {
    return this.service.listApplicants(ctxFromUser(user), query);
  }

  @Get('applicants/trashed')
  listTrashedApplicants(@CurrentUser() user: RequestUser, @Query() query: PaginationQueryDto) {
    return this.service.listTrashedApplicants(ctxFromUser(user), query);
  }

  @Post('applicants')
  @Permissions('employees:write')
  createApplicant(
    @CurrentUser() user: RequestUser,
    @Body() body: Record<string, string>,
  ) {
    return this.service.createApplicant(ctxFromUser(user), body);
  }

  @Patch('applicants/:id/soft-delete')
  @Permissions('employees:write')
  softDeleteApplicant(
    @CurrentUser() user: RequestUser,
    @Param('id') id: string,
  ) {
    return this.service.softDeleteApplicant(ctxFromUser(user), id);
  }

  @Patch('applicants/:id/restore')
  @Permissions('employees:write')
  restoreApplicant(
    @CurrentUser() user: RequestUser,
    @Param('id') id: string,
  ) {
    return this.service.restoreApplicant(ctxFromUser(user), id);
  }

  @Get('applicants/:id')
  getApplicant(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    return this.service.getApplicant(ctxFromUser(user), id);
  }

  @Put('applicants/:id')
  @Patch('applicants/:id')
  @Permissions('employees:write')
  updateApplicant(
    @CurrentUser() user: RequestUser,
    @Param('id') id: string,
    @Body() body: Record<string, string>,
  ) {
    return this.service.updateApplicant(ctxFromUser(user), id, body);
  }

  @Delete('applicants/:id')
  @Permissions('employees:write')
  removeApplicant(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    return this.service.removeApplicant(ctxFromUser(user), id);
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
