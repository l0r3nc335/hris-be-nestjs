export interface ListEntityDto {
  id: string;
  tenantId: string;
  name: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  firstName?: string;
  lastName?: string;
}

export interface EmployeeDepartmentDto extends ListEntityDto {
  departmentId: string | null;
  departmentName: string;
}

export interface Timestamped {
  id: string;
  tenantId: string;
  createdAt: Date;
  updatedAt: Date;
}

export function toListDto(
  record: Timestamped,
  name: string,
  status: string,
): ListEntityDto {
  return {
    id: record.id,
    tenantId: record.tenantId,
    name,
    status,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}

export function employeeName(firstName: string, lastName: string): string {
  return `${firstName} ${lastName}`.trim();
}

export function userName(firstName: string, lastName: string, email: string): string {
  const full = employeeName(firstName, lastName);
  return full || email;
}
