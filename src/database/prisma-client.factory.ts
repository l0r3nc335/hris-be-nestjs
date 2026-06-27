import { PrismaClient } from '@prisma/client';
import { generateOpaqueId } from '../common/utils/opaque-id';

const MODELS_WITH_OPAQUE_ID = new Set([
  'Tenant',
  'User',
  'RefreshToken',
  'Role',
  'Permission',
  'AuditLog',
  'Department',
  'Position',
  'Employee',
  'AttendanceRecord',
  'LeaveType',
  'LeaveRequest',
  'PayrollRecord',
  'CompensationRecord',
  'SalaryStructure',
  'TimeLog',
  'JobPosting',
  'Applicant',
  'Interview',
  'PerformanceReview',
  'Notification',
  'OnboardingTask',
  'BenefitPlan',
  'TrainingCourse',
  'Message',
  'CompanySetting',
  'BillingInvoice',
  'Document',
]);

function assignOpaqueIds(data: unknown): void {
  if (!data || typeof data !== 'object') return;
  if (Array.isArray(data)) {
    for (const item of data) assignOpaqueIds(item);
    return;
  }
  const record = data as Record<string, unknown>;
  record.id = generateOpaqueId();
  for (const value of Object.values(record)) {
    if (value && typeof value === 'object') assignOpaqueIds(value);
  }
}

export function createPrismaClient(): PrismaClient {
  return new PrismaClient().$extends({
    query: {
      $allModels: {
        create({ model, args, query }) {
          if (MODELS_WITH_OPAQUE_ID.has(model) && args.data) {
            assignOpaqueIds(args.data);
          }
          return query(args);
        },
        createMany({ model, args, query }) {
          if (MODELS_WITH_OPAQUE_ID.has(model) && args.data) {
            assignOpaqueIds(args.data);
          }
          return query(args);
        },
      },
    },
  }) as unknown as PrismaClient;
}
