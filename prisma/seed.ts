// @ts-nocheck
import * as bcrypt from 'bcrypt';
import { createPrismaClient } from './prisma-client';
import { generateOpaqueId } from '../src/common/utils/opaque-id';

const prisma = createPrismaClient();

const SEEDED_ROLE_SLUGS = [
  'admin',
  'manager',
  'employee',
  'hr_admin',
  'hr_sys_admin',
  'hr_payroll',
  'hr_recruiter',
  'executive',
  'finance',
] as const;

const EXTRA_ROLES: { slug: string; name: string }[] = [
  { slug: 'manager', name: 'Manager' },
  { slug: 'employee', name: 'Employee' },
  { slug: 'hr_admin', name: 'HR Admin' },
  { slug: 'hr_sys_admin', name: 'HR System Admin' },
  { slug: 'hr_payroll', name: 'HR Payroll' },
  { slug: 'hr_recruiter', name: 'HR Recruiter' },
  { slug: 'executive', name: 'Executive' },
  { slug: 'finance', name: 'Finance' },
];

const SEED_COUNT = 200;
const BATCH_SIZE = 100;

const PERMISSIONS = [
  'users:read',
  'users:write',
  'employees:read',
  'employees:write',
  'employee-departments:read',
  'employee-departments:write',
  'departments:read',
  'departments:write',
  'positions:read',
  'positions:write',
  'attendance:read',
  'attendance:write',
  'leave:read',
  'leave:approve',
  'payroll:read',
  'payroll:run',
  'compensation:read',
  'compensation:write',
  'time-tracking:read',
  'time-tracking:write',
  'recruitment:read',
  'recruitment:write',
  'interviews:read',
  'interviews:write',
  'performance:read',
  'performance:write',
  'organization:read',
  'documents:read',
  'documents:write',
  'notifications:read',
  'roles:manage',
  'tenants:manage',
  'audit:read',
  'settings:write',
  'reports:read',
  'billing:read',
  'onboarding:read',
  'onboarding:write',
  'benefits:read',
  'benefits:write',
  'training:read',
  'training:write',
  'messages:read',
];

async function batchCreateMany(
  buildRow: (index: number) => Record<string, unknown>,
  createMany: (data: Record<string, unknown>[]) => Promise<{ count: number }>,
  count = SEED_COUNT,
) {
  for (let start = 0; start < count; start += BATCH_SIZE) {
    const batch = Array.from(
      { length: Math.min(BATCH_SIZE, count - start) },
      (_, j) => ({ ...buildRow(start + j), id: generateOpaqueId() }),
    );
    await createMany(batch);
  }
}

async function clearTenantData(tenantId: string, preserveUserIds: string[]) {
  await prisma.message.deleteMany({ where: { tenantId } });
  await prisma.onboardingTask.deleteMany({ where: { tenantId } });
  await prisma.benefitPlan.deleteMany({ where: { tenantId } });
  await prisma.trainingCourse.deleteMany({ where: { tenantId } });
  await prisma.interview.deleteMany({ where: { tenantId } });
  await prisma.applicant.deleteMany({ where: { tenantId } });
  await prisma.jobPosting.deleteMany({ where: { tenantId } });
  await prisma.timeLog.deleteMany({ where: { tenantId } });
  await prisma.performanceReview.deleteMany({ where: { tenantId } });
  await prisma.notification.deleteMany({ where: { tenantId } });
  await prisma.billingInvoice.deleteMany({ where: { tenantId } });
  await prisma.companySetting.deleteMany({ where: { tenantId } });
  await prisma.document.deleteMany({ where: { tenantId } });
  await prisma.salaryStructure.deleteMany({ where: { tenantId } });
  await prisma.compensationRecord.deleteMany({ where: { tenantId } });
  await prisma.payrollRecord.deleteMany({ where: { tenantId } });
  await prisma.leaveRequest.deleteMany({ where: { tenantId } });
  await prisma.leaveType.deleteMany({ where: { tenantId } });
  await prisma.attendanceRecord.deleteMany({ where: { tenantId } });
  await prisma.employee.deleteMany({ where: { tenantId } });
  await prisma.position.deleteMany({ where: { tenantId } });
  await prisma.department.deleteMany({ where: { tenantId } });
  await prisma.auditLog.deleteMany({ where: { tenantId } });

  const demoRoles = await prisma.role.findMany({
    where: { tenantId, slug: { notIn: [...SEEDED_ROLE_SLUGS] } },
    select: { id: true },
  });
  if (demoRoles.length > 0) {
    const roleIds = demoRoles.map((r) => r.id);
    await prisma.rolePermission.deleteMany({ where: { roleId: { in: roleIds } } });
    await prisma.userRole.deleteMany({ where: { roleId: { in: roleIds } } });
    await prisma.role.deleteMany({ where: { id: { in: roleIds } } });
  }

  const nonAdminUsers = await prisma.user.findMany({
    where: { tenantId, id: { notIn: preserveUserIds } },
    select: { id: true },
  });
  if (nonAdminUsers.length > 0) {
    const userIds = nonAdminUsers.map((u) => u.id);
    await prisma.userRole.deleteMany({ where: { userId: { in: userIds } } });
    await prisma.refreshToken.deleteMany({ where: { userId: { in: userIds } } });
    await prisma.user.deleteMany({ where: { id: { in: userIds } } });
  }
}

async function main() {
  const tenant = await prisma.tenant.upsert({
    where: { slug: 'acme' },
    update: {},
    create: {
      id: generateOpaqueId(),
      name: 'Acme HRIS',
      slug: 'acme',
      status: 'active',
    },
  });

  for (const code of PERMISSIONS) {
    await prisma.permission.upsert({
      where: { code },
      update: {},
      create: { id: generateOpaqueId(), code, description: code },
    });
  }

  const adminRole = await prisma.role.upsert({
    where: { tenantId_slug: { tenantId: tenant.id, slug: 'admin' } },
    update: {},
    create: {
      id: generateOpaqueId(),
      tenantId: tenant.id,
      name: 'Administrator',
      slug: 'admin',
    },
  });

  for (const { slug, name } of EXTRA_ROLES) {
    await prisma.role.upsert({
      where: { tenantId_slug: { tenantId: tenant.id, slug } },
      update: {},
      create: { id: generateOpaqueId(), tenantId: tenant.id, name, slug },
    });
  }

  const allPermissions = await prisma.permission.findMany();
  const readPermissions = allPermissions.filter((p) => p.code.endsWith(':read'));

  await prisma.rolePermission.deleteMany({
    where: {
      roleId: adminRole.id,
      permissionId: { notIn: readPermissions.map((p) => p.id) },
    },
  });

  for (const perm of readPermissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: adminRole.id,
          permissionId: perm.id,
        },
      },
      update: {},
      create: { roleId: adminRole.id, permissionId: perm.id },
    });
  }

  const passwordHash = await bcrypt.hash('password', 10);

  const superadminUser = await prisma.user.upsert({
    where: {
      tenantId_email: { tenantId: tenant.id, email: 'superadmin@hris.com' },
    },
    update: { passwordHash, role: 'superadmin' },
    create: {
      id: generateOpaqueId(),
      tenantId: tenant.id,
      email: 'superadmin@hris.com',
      passwordHash,
      firstName: 'Super',
      lastName: 'Admin',
      role: 'superadmin',
      isActive: true,
      emailVerified: true,
    },
  });

  await prisma.user.deleteMany({
    where: { tenantId: tenant.id, email: 'admin@hris.com' },
  });

  const admin1User = await prisma.user.upsert({
    where: {
      tenantId_email: { tenantId: tenant.id, email: 'admin1@hris.com' },
    },
    update: { passwordHash, role: 'admin' },
    create: {
      id: generateOpaqueId(),
      tenantId: tenant.id,
      email: 'admin1@hris.com',
      passwordHash,
      firstName: 'Admin',
      lastName: 'One',
      role: 'admin',
      isActive: true,
      emailVerified: true,
    },
  });

  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: admin1User.id, roleId: adminRole.id } },
    update: {},
    create: { userId: admin1User.id, roleId: adminRole.id },
  });

  const sampleUsers = await Promise.all(
    ['user1', 'user2', 'user3'].map((name, index) =>
      prisma.user.upsert({
        where: {
          tenantId_email: {
            tenantId: tenant.id,
            email: `${name}@hris.local`,
          },
        },
        update: { passwordHash, role: 'user' },
        create: {
          id: generateOpaqueId(),
          tenantId: tenant.id,
          email: `${name}@hris.local`,
          passwordHash,
          firstName: 'User',
          lastName: String(index + 1),
          role: 'user',
          isActive: true,
          emailVerified: true,
        },
      }),
    ),
  );

  await clearTenantData(tenant.id, [
    superadminUser.id,
    admin1User.id,
    ...sampleUsers.map((u) => u.id),
  ]);

  await batchCreateMany(
    (i) => ({
      tenantId: tenant.id,
      name: `Department ${i + 1}`,
      status: 'active',
    }),
    (data) => prisma.department.createMany({ data }),
  );

  const departments = await prisma.department.findMany({
    where: { tenantId: tenant.id },
    orderBy: { name: 'asc' },
    select: { id: true },
  });

  await batchCreateMany(
    (i) => ({
      tenantId: tenant.id,
      title: `Position ${i + 1}`,
      status: 'active',
      departmentId: departments[i % departments.length].id,
    }),
    (data) => prisma.position.createMany({ data }),
  );

  const positions = await prisma.position.findMany({
    where: { tenantId: tenant.id },
    orderBy: { title: 'asc' },
    select: { id: true },
  });

  await batchCreateMany(
    (i) => ({
      tenantId: tenant.id,
      firstName: 'Employee',
      lastName: `${i + 1}`,
      status: i === SEED_COUNT - 1 ? 'inactive' : 'active',
      departmentId: departments[i % departments.length].id,
      positionId: positions[i % positions.length].id,
      hireDate: new Date(2024, i % 12, (i % 28) + 1),
    }),
    (data) => prisma.employee.createMany({ data }),
  );

  const employees = await prisma.employee.findMany({
    where: { tenantId: tenant.id },
    orderBy: { lastName: 'asc' },
    select: { id: true },
  });

  await prisma.employee.update({
    where: { id: employees[0].id },
    data: { userId: admin1User.id },
  });

  const managerId = employees[0].id;
  await Promise.all(
    employees.slice(1, 11).map((emp) =>
      prisma.employee.update({
        where: { id: emp.id },
        data: { managerId },
      }),
    ),
  );

  await batchCreateMany(
    (i) => ({
      tenantId: tenant.id,
      email: `user-${i + 1}@hris.local`,
      passwordHash,
      firstName: 'User',
      lastName: `${i + 1}`,
      role: 'user',
      isActive: i !== SEED_COUNT - 1,
      emailVerified: true,
    }),
    (data) => prisma.user.createMany({ data }),
  );

  await batchCreateMany(
    (i) => ({
      tenantId: tenant.id,
      name: `Role ${i + 1}`,
      slug: `role-${i + 1}`,
    }),
    (data) => prisma.role.createMany({ data }),
  );

  const leaveTypes = await Promise.all(
    ['Annual Leave', 'Sick Leave', 'Personal Leave', 'Maternity Leave', 'Unpaid Leave'].map(
      (name) =>
        prisma.leaveType.create({
          data: {
            id: generateOpaqueId(),
            tenantId: tenant.id,
            name,
            status: 'active',
          },
        }),
    ),
  );

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  await batchCreateMany(
    (i) => ({
      tenantId: tenant.id,
      employeeId: employees[i % employees.length].id,
      date: today,
      status: i % 2 === 0 ? 'present' : 'late',
    }),
    (data) => prisma.attendanceRecord.createMany({ data }),
  );

  await batchCreateMany(
    (i) => ({
      tenantId: tenant.id,
      employeeId: employees[i % employees.length].id,
      leaveTypeId: leaveTypes[i % leaveTypes.length].id,
      status: i === 0 ? 'pending' : 'approved',
      startDate: new Date(2025, 5, (i % 28) + 1),
      endDate: new Date(2025, 5, (i % 28) + 2),
    }),
    (data) => prisma.leaveRequest.createMany({ data }),
  );

  await batchCreateMany(
    (i) => ({
      tenantId: tenant.id,
      employeeId: employees[i % employees.length].id,
      period: `2025-${String((i % 12) + 1).padStart(2, '0')}`,
      status: 'processed',
      amount: 50000 + i * 500,
    }),
    (data) => prisma.payrollRecord.createMany({ data }),
  );

  await batchCreateMany(
    (i) => ({
      tenantId: tenant.id,
      employeeId: employees[i % employees.length].id,
      baseSalary: 75000 + i * 250,
      status: 'active',
    }),
    (data) => prisma.compensationRecord.createMany({ data }),
  );

  await batchCreateMany(
    (i) => ({
      tenantId: tenant.id,
      employeeId: employees[i % employees.length].id,
      status: i % 2 === 0 ? 'stopped' : 'running',
      startedAt: new Date(Date.now() - (i + 1) * 3600000),
      endedAt: i % 2 === 0 ? new Date() : null,
    }),
    (data) => prisma.timeLog.createMany({ data }),
  );

  await batchCreateMany(
    (i) => ({
      tenantId: tenant.id,
      employeeId: employees[i % employees.length].id,
      period: `2025-Q${(i % 4) + 1}`,
      status: i === 0 ? 'draft' : 'approved',
    }),
    (data) => prisma.performanceReview.createMany({ data }),
  );

  await batchCreateMany(
    (i) => ({
      tenantId: tenant.id,
      name: `Salary Structure ${i + 1}`,
      status: 'active',
    }),
    (data) => prisma.salaryStructure.createMany({ data }),
  );

  await batchCreateMany(
    (i) => ({
      tenantId: tenant.id,
      title: `Job Posting ${i + 1}`,
      status: i < SEED_COUNT - 1 ? 'open' : 'closed',
    }),
    (data) => prisma.jobPosting.createMany({ data }),
  );

  const jobs = await prisma.jobPosting.findMany({
    where: { tenantId: tenant.id },
    orderBy: { title: 'asc' },
    select: { id: true },
  });

  await batchCreateMany(
    (i) => ({
      tenantId: tenant.id,
      jobId: jobs[i % jobs.length].id,
      name: `Applicant ${i + 1}`,
      status: 'applied',
    }),
    (data) => prisma.applicant.createMany({ data }),
  );

  const applicants = await prisma.applicant.findMany({
    where: { tenantId: tenant.id },
    orderBy: { name: 'asc' },
    select: { id: true },
  });

  await batchCreateMany(
    (i) => ({
      tenantId: tenant.id,
      applicantId: applicants[i % applicants.length].id,
      scheduledAt: new Date(Date.now() + (i + 1) * 86400000),
      status: 'scheduled',
    }),
    (data) => prisma.interview.createMany({ data }),
  );

  await batchCreateMany(
    (i) => ({
      tenantId: tenant.id,
      userId: admin1User.id,
      title: `Notification ${i + 1}`,
      body: `Details for notification ${i + 1}`,
      status: 'active',
      read: i % 2 === 0,
    }),
    (data) => prisma.notification.createMany({ data }),
  );

  await batchCreateMany(
    (i) => ({
      tenantId: tenant.id,
      name: `Onboarding Task ${i + 1}`,
      status: 'active',
      employeeId: employees[i % employees.length].id,
    }),
    (data) => prisma.onboardingTask.createMany({ data }),
  );

  await batchCreateMany(
    (i) => ({
      tenantId: tenant.id,
      name: `Benefit Plan ${i + 1}`,
      planType: i % 2 === 0 ? 'health' : 'dental',
      status: 'active',
    }),
    (data) => prisma.benefitPlan.createMany({ data }),
  );

  await batchCreateMany(
    (i) => ({
      tenantId: tenant.id,
      name: `Training Course ${i + 1}`,
      category: i % 2 === 0 ? 'compliance' : 'skills',
      status: 'active',
    }),
    (data) => prisma.trainingCourse.createMany({ data }),
  );

  await batchCreateMany(
    (i) => ({
      tenantId: tenant.id,
      userId: admin1User.id,
      from: `HR Team ${i + 1}`,
      subject: `Message ${i + 1}`,
      body: `Inbox message body ${i + 1}`,
      read: i % 2 === 0,
    }),
    (data) => prisma.message.createMany({ data }),
  );

  await batchCreateMany(
    (i) => ({
      tenantId: tenant.id,
      amount: 1000 * (i + 1),
      status: i % 2 === 0 ? 'paid' : 'pending',
      dueDate: new Date(2025, 6, (i % 28) + 1),
    }),
    (data) => prisma.billingInvoice.createMany({ data }),
  );

  await batchCreateMany(
    (i) => ({
      tenantId: tenant.id,
      employeeId: employees[i % employees.length].id,
      filename: `doc-${i + 1}.pdf`,
      originalName: `Document ${i + 1}.pdf`,
      mimeType: 'application/pdf',
      size: 1024 * (i + 1),
      path: `/uploads/doc-${i + 1}.pdf`,
    }),
    (data) => prisma.document.createMany({ data }),
  );

  await Promise.all([
    prisma.companySetting.create({
      data: {
        id: generateOpaqueId(),
        tenantId: tenant.id,
        key: 'companyName',
        value: 'Acme HRIS',
        status: 'active',
      },
    }),
    prisma.companySetting.create({
      data: {
        id: generateOpaqueId(),
        tenantId: tenant.id,
        key: 'timezone',
        value: 'UTC',
        status: 'active',
      },
    }),
    prisma.companySetting.create({
      data: {
        id: generateOpaqueId(),
        tenantId: tenant.id,
        key: 'currency',
        value: 'USD',
        status: 'active',
      },
    }),
    prisma.companySetting.create({
      data: {
        id: generateOpaqueId(),
        tenantId: tenant.id,
        key: 'fiscalYearStart',
        value: 'January',
        status: 'active',
      },
    }),
    prisma.companySetting.create({
      data: {
        id: generateOpaqueId(),
        tenantId: tenant.id,
        key: 'leavePolicy',
        value: 'Standard',
        status: 'active',
      },
    }),
  ]);

  await batchCreateMany(
    (i) => ({
      tenantId: tenant.id,
      actorId: admin1User.id,
      action: i === SEED_COUNT - 1 ? 'seed.complete' : `seed.action.${i + 1}`,
      entity: 'system',
      entityId: tenant.id,
    }),
    (data) => prisma.auditLog.createMany({ data }),
  );

  console.log('Seed complete:', {
    tenantId: tenant.id,
    superadminEmail: 'superadmin@hris.com',
    adminEmail: 'admin1@hris.com',
    seededRoles: SEEDED_ROLE_SLUGS,
    sampleUsers: sampleUsers.map((u) => u.email),
    password: 'password',
    seedCount: SEED_COUNT,
    departments: departments.length,
    employees: employees.length,
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
