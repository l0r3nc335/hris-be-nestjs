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

  @Post('jobs')
  createJob(
    @CurrentUser() user: RequestUser,
    @Body() body: Record<string, string>,
  ) {
    return this.service.createJob(user.tenantId, body);
  }

  @Get('jobs/:id')
  getJob(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    return this.service.getJob(user.tenantId, id);
  }

  @Put('jobs/:id')
  @Patch('jobs/:id')
  updateJob(
    @CurrentUser() user: RequestUser,
    @Param('id') id: string,
    @Body() body: Record<string, string>,
  ) {
    return this.service.updateJob(user.tenantId, id, body);
  }

  @Delete('jobs/:id')
  removeJob(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    return this.service.removeJob(user.tenantId, id);
  }

  @Get('applicants')
  listApplicants(@CurrentUser() user: RequestUser) {
    return this.service.listApplicants(user.tenantId);
  }

  @Post('applicants')
  createApplicant(
    @CurrentUser() user: RequestUser,
    @Body() body: Record<string, string>,
  ) {
    return this.service.createApplicant(user.tenantId, body);
  }

  @Get('applicants/:id')
  getApplicant(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    return this.service.getApplicant(user.tenantId, id);
  }

  @Post('applicants/:id/schedule-interview')
  scheduleInterview(
    @Param('id') id: string,
    @Body() body: Record<string, string>,
  ) {
    return this.service.scheduleInterview(id, body);
  }

  @Post('applicants/:id/hire')
  hire(@Param('id') id: string) {
    return this.service.hire(id);
  }

  @Post('applicants/:id/reject')
  reject(@Param('id') id: string) {
    return this.service.reject(id);
  }
}
