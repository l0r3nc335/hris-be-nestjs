import {
  employeeName,
  ListEntityDto,
  toListDto,
  userName,
} from '../mappers/list-entity.mapper';
import { resolveListStatus } from '../services/soft-delete-crud.helper';

type WithDeleted = { deletedAt?: Date | null };

export function mapEmployee(
  record: {
    id: string;
    tenantId: string;
    firstName: string;
    lastName: string;
    status: string;
    createdAt: Date;
    updatedAt: Date;
  } & WithDeleted,
): ListEntityDto {
  return toListDto(
    record,
    employeeName(record.firstName, record.lastName),
    resolveListStatus(record.status, record.deletedAt),
  );
}

export function mapUser(
  record: {
    id: string;
    tenantId: string;
    firstName: string;
    lastName: string;
    email: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  } & WithDeleted,
): ListEntityDto {
  const status = record.deletedAt
    ? 'deleted'
    : record.isActive
      ? 'active'
      : 'inactive';
  return toListDto(
    record,
    userName(record.firstName, record.lastName, record.email),
    status,
  );
}

export function mapRole(
  record: {
    id: string;
    tenantId: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
  } & WithDeleted,
): ListEntityDto {
  return toListDto(
    record,
    record.name,
    resolveListStatus('active', record.deletedAt),
  );
}

export function mapTenant(
  record: {
    id: string;
    name: string;
    status: string;
    createdAt: Date;
    updatedAt: Date;
  } & WithDeleted,
): ListEntityDto {
  return {
    id: record.id,
    tenantId: record.id,
    name: record.name,
    status: resolveListStatus(record.status, record.deletedAt),
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}

export function mapAuditLog(record: {
  id: string;
  tenantId: string;
  action: string;
  entity: string;
  createdAt: Date;
}): ListEntityDto {
  return {
    id: record.id,
    tenantId: record.tenantId,
    name: record.action,
    status: record.entity,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.createdAt.toISOString(),
  };
}

export function mapDocument(
  record: {
    id: string;
    tenantId: string;
    originalName: string;
    createdAt: Date;
    updatedAt: Date;
  } & WithDeleted,
): ListEntityDto {
  return toListDto(
    record,
    record.originalName,
    resolveListStatus('stored', record.deletedAt),
  );
}

export function mapBillingInvoice(
  record: {
    id: string;
    tenantId: string;
    amount: { toString(): string };
    status: string;
    dueDate: Date;
    createdAt: Date;
    updatedAt: Date;
  } & WithDeleted,
): ListEntityDto {
  return toListDto(
    record,
    `Invoice $${record.amount.toString()}`,
    resolveListStatus(record.status, record.deletedAt),
  );
}

export function mapCompanySetting(
  record: {
    id: string;
    tenantId: string;
    key: string;
    value: string;
    status: string;
    createdAt: Date;
    updatedAt: Date;
  } & WithDeleted,
): ListEntityDto {
  return toListDto(
    record,
    `${record.key}: ${record.value}`,
    resolveListStatus(record.status, record.deletedAt),
  );
}

export function mapInterview(
  record: {
    id: string;
    tenantId: string;
    applicantId: string;
    status: string;
    scheduledAt: Date;
    createdAt: Date;
    updatedAt: Date;
  } & WithDeleted,
): ListEntityDto {
  return toListDto(
    record,
    `Interview ${record.scheduledAt.toISOString().slice(0, 10)}`,
    resolveListStatus(record.status, record.deletedAt),
  );
}

export function mapLeaveRequest(
  record: {
    id: string;
    tenantId: string;
    status: string;
    startDate: Date;
    endDate: Date;
    createdAt: Date;
    updatedAt: Date;
    leaveType?: { name: string };
  } & WithDeleted,
): ListEntityDto {
  const typeName = record.leaveType?.name ?? 'Leave';
  return toListDto(
    record,
    `${typeName} (${record.startDate.toISOString().slice(0, 10)})`,
    resolveListStatus(record.status, record.deletedAt),
  );
}

export function mapPayroll(
  record: {
    id: string;
    tenantId: string;
    period: string;
    status: string;
    createdAt: Date;
    updatedAt: Date;
  } & WithDeleted,
): ListEntityDto {
  return toListDto(
    record,
    `Payroll ${record.period}`,
    resolveListStatus(record.status, record.deletedAt),
  );
}

export function mapCompensation(
  record: {
    id: string;
    tenantId: string;
    baseSalary: { toString(): string };
    status: string;
    createdAt: Date;
    updatedAt: Date;
  } & WithDeleted,
): ListEntityDto {
  return toListDto(
    record,
    `Salary $${record.baseSalary.toString()}`,
    resolveListStatus(record.status, record.deletedAt),
  );
}

export function mapAttendance(
  record: {
    id: string;
    tenantId: string;
    date: Date;
    status: string;
    createdAt: Date;
    updatedAt: Date;
  } & WithDeleted,
): ListEntityDto {
  return toListDto(
    record,
    `Attendance ${record.date.toISOString().slice(0, 10)}`,
    resolveListStatus(record.status, record.deletedAt),
  );
}

export function mapTimeLog(
  record: {
    id: string;
    tenantId: string;
    status: string;
    startedAt: Date;
    createdAt: Date;
    updatedAt: Date;
  } & WithDeleted,
): ListEntityDto {
  return toListDto(
    record,
    `Time log ${record.startedAt.toISOString().slice(0, 16)}`,
    resolveListStatus(record.status, record.deletedAt),
  );
}

export function mapPerformance(
  record: {
    id: string;
    tenantId: string;
    period: string;
    status: string;
    createdAt: Date;
    updatedAt: Date;
  } & WithDeleted,
): ListEntityDto {
  return toListDto(
    record,
    `Review ${record.period}`,
    resolveListStatus(record.status, record.deletedAt),
  );
}

export function mapPosition(
  record: {
    id: string;
    tenantId: string;
    title: string;
    status: string;
    createdAt: Date;
    updatedAt: Date;
  } & WithDeleted,
): ListEntityDto {
  return toListDto(
    record,
    record.title,
    resolveListStatus(record.status, record.deletedAt),
  );
}

export function mapDepartment(
  record: {
    id: string;
    tenantId: string;
    name: string;
    status: string;
    createdAt: Date;
    updatedAt: Date;
  } & WithDeleted,
): ListEntityDto {
  return toListDto(
    record,
    record.name,
    resolveListStatus(record.status, record.deletedAt),
  );
}

export function mapNotification(
  record: {
    id: string;
    tenantId: string;
    title: string;
    status: string;
    read: boolean;
    createdAt: Date;
    updatedAt: Date;
  } & WithDeleted,
): ListEntityDto {
  const status = record.deletedAt
    ? 'deleted'
    : record.read
      ? 'read'
      : record.status;
  return toListDto(record, record.title, status);
}

export function mapJobPosting(
  record: {
    id: string;
    tenantId: string;
    title: string;
    status: string;
    createdAt: Date;
    updatedAt: Date;
  } & WithDeleted,
): ListEntityDto {
  return toListDto(
    record,
    record.title,
    resolveListStatus(record.status, record.deletedAt),
  );
}

export function mapApplicant(
  record: {
    id: string;
    tenantId: string;
    name: string;
    status: string;
    createdAt: Date;
    updatedAt: Date;
  } & WithDeleted,
): ListEntityDto {
  return toListDto(
    record,
    record.name,
    resolveListStatus(record.status, record.deletedAt),
  );
}

export function mapSalaryStructure(
  record: {
    id: string;
    tenantId: string;
    name: string;
    status: string;
    createdAt: Date;
    updatedAt: Date;
  } & WithDeleted,
): ListEntityDto {
  return toListDto(
    record,
    record.name,
    resolveListStatus(record.status, record.deletedAt),
  );
}

export function mapLeaveType(
  record: {
    id: string;
    tenantId: string;
    name: string;
    status: string;
    createdAt: Date;
    updatedAt: Date;
  } & WithDeleted,
): ListEntityDto {
  return toListDto(
    record,
    record.name,
    resolveListStatus(record.status, record.deletedAt),
  );
}
