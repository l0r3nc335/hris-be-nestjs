import { Injectable } from '@nestjs/common';
import { HrRecordsService } from '../../common/services/hr-records.service';

@Injectable()
export class RecruitmentService {
  constructor(private readonly hr: HrRecordsService) {}

  listJobs(tenantId: string) {
    return this.hr.list(tenantId, 'recruitment-jobs');
  }
  getJob(tenantId: string, id: string) {
    return this.hr.getById(tenantId, 'recruitment-jobs', id);
  }
  createJob(tenantId: string, body: { name?: string }) {
    return this.hr.createStub(tenantId, 'recruitment-jobs', body.name ?? 'Job');
  }
  updateJob(
    tenantId: string,
    id: string,
    body: { name?: string; status?: string },
  ) {
    return this.hr.getById(tenantId, 'recruitment-jobs', id).then((e) => ({
      ...e,
      name: body.name ?? e.name,
      status: body.status ?? e.status,
    }));
  }
  removeJob(_tenantId: string, id: string) {
    return { id, deleted: true };
  }

  listApplicants(tenantId: string) {
    return this.hr.list(tenantId, 'recruitment-applicants');
  }
  getApplicant(tenantId: string, id: string) {
    return this.hr.getById(tenantId, 'recruitment-applicants', id);
  }
  createApplicant(tenantId: string, body: { name?: string }) {
    return this.hr.createStub(
      tenantId,
      'recruitment-applicants',
      body.name ?? 'Applicant',
    );
  }
  scheduleInterview(applicantId: string, body: Record<string, string>) {
    return { applicantId, interview: body, status: 'scheduled' };
  }
  hire(applicantId: string) {
    return { applicantId, status: 'hired' };
  }
  reject(applicantId: string) {
    return { applicantId, status: 'rejected' };
  }
}
