import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const PERMISSIONS = [
  'users:read',
  'users:write',
  'employees:read',
  'employees:write',
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
];

async function clearTenantData(tenantId: string) {
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
}

async function main() {
  const tenant = await prisma.tenant.upsert({
    where: { slug: 'acme' },
    update: {},
    create: {
      name: 'Acme HRIS',
      slug: 'acme',
      status: 'active',
    },
  });

  for (const code of PERMISSIONS) {
    await prisma.permission.upsert({
      where: { code },
      update: {},
      create: { code, description: code },
    });
  }

  const adminRole = await prisma.role.upsert({
    where: { tenantId_slug: { tenantId: tenant.id, slug: 'admin' } },
    update: {},
    create: {
      tenantId: tenant.id,
      name: 'Administrator',
      slug: 'admin',
    },
  });

  const allPermissions = await prisma.permission.findMany();
  for (const perm of allPermissions) {
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
  const adminUser = await prisma.user.upsert({
    where: {
      tenantId_email: { tenantId: tenant.id, email: 'admin@hris.com' },
    },
    update: { passwordHash },
    create: {
      tenantId: tenant.id,
      email: 'admin@hris.com',
      passwordHash,
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin',
      isActive: true,
      emailVerified: true,
    },
  });

  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: adminUser.id, roleId: adminRole.id } },
    update: {},
    create: { userId: adminUser.id, roleId: adminRole.id },
  });

  await clearTenantData(tenant.id);

  const departments = await Promise.all(
    Array.from({ length: 5 }, (_, i) =>
      prisma.department.create({
        data: {
          tenantId: tenant.id,
          name: `Department ${i + 1}`,
          status: 'active',
        },
      }),
    ),
  );

  const positions = await Promise.all(
    departments.map((dept, i) =>
      prisma.position.create({
        data: {
          tenantId: tenant.id,
          title: `Position ${i + 1}`,
          status: 'active',
          departmentId: dept.id,
        },
      }),
    ),
  );

  const employees = await Promise.all(
    Array.from({ length: 5 }, (_, i) =>
      prisma.employee.create({
        data: {
          tenantId: tenant.id,
          firstName: `Employee`,
          lastName: `${i + 1}`,
          status: i === 4 ? 'inactive' : 'active',
          departmentId: departments[i % departments.length].id,
          positionId: positions[i % positions.length].id,
          hireDate: new Date(2024, i, 1),
        },
      }),
    ),
  );

  await prisma.employee.update({
    where: { id: employees[0].id },
    data: { userId: adminUser.id },
  });

  const leaveTypes = await Promise.all(
    ['Annual Leave', 'Sick Leave', 'Personal Leave', 'Maternity Leave', 'Unpaid Leave'].map(
      (name) =>
        prisma.leaveType.create({
          data: { tenantId: tenant.id, name, status: 'active' },
        }),
    ),
  );

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  await Promise.all(
    employees.flatMap((emp, i) => [
      prisma.attendanceRecord.create({
        data: {
          tenantId: tenant.id,
          employeeId: emp.id,
          date: today,
          status: i % 2 === 0 ? 'present' : 'late',
        },
      }),
      prisma.leaveRequest.create({
        data: {
          tenantId: tenant.id,
          employeeId: emp.id,
          leaveTypeId: leaveTypes[i % leaveTypes.length].id,
          status: i === 0 ? 'pending' : 'approved',
          startDate: new Date(2025, 5, 1 + i),
          endDate: new Date(2025, 5, 2 + i),
        },
      }),
      prisma.payrollRecord.create({
        data: {
          tenantId: tenant.id,
          employeeId: emp.id,
          period: `2025-0${i + 1}`,
          status: 'processed',
          amount: 50000 + i * 5000,
        },
      }),
      prisma.compensationRecord.create({
        data: {
          tenantId: tenant.id,
          employeeId: emp.id,
          baseSalary: 75000 + i * 2500,
          status: 'active',
        },
      }),
      prisma.timeLog.create({
        data: {
          tenantId: tenant.id,
          employeeId: emp.id,
          status: i % 2 === 0 ? 'stopped' : 'running',
          startedAt: new Date(Date.now() - (i + 1) * 3600000),
          endedAt: i % 2 === 0 ? new Date() : null,
        },
      }),
      prisma.performanceReview.create({
        data: {
          tenantId: tenant.id,
          employeeId: emp.id,
          period: `2025-Q${(i % 4) + 1}`,
          status: i === 0 ? 'draft' : 'approved',
        },
      }),
    ]),
  );

  await Promise.all(
    Array.from({ length: 5 }, (_, i) =>
      prisma.salaryStructure.create({
        data: {
          tenantId: tenant.id,
          name: `Salary Structure ${i + 1}`,
          status: 'active',
        },
      }),
    ),
  );

  const jobs = await Promise.all(
    Array.from({ length: 5 }, (_, i) =>
      prisma.jobPosting.create({
        data: {
          tenantId: tenant.id,
          title: `Job Posting ${i + 1}`,
          status: i < 4 ? 'open' : 'closed',
        },
      }),
    ),
  );

  const applicants = await Promise.all(
    jobs.map((job, i) =>
      prisma.applicant.create({
        data: {
          tenantId: tenant.id,
          jobId: job.id,
          name: `Applicant ${i + 1}`,
          status: 'applied',
        },
      }),
    ),
  );

  await Promise.all(
    applicants.map((applicant, i) =>
      prisma.interview.create({
        data: {
          tenantId: tenant.id,
          applicantId: applicant.id,
          scheduledAt: new Date(Date.now() + (i + 1) * 86400000),
          status: 'scheduled',
        },
      }),
    ),
  );

  await Promise.all(
    Array.from({ length: 5 }, (_, i) =>
      prisma.notification.create({
        data: {
          tenantId: tenant.id,
          userId: adminUser.id,
          title: `Notification ${i + 1}`,
          status: 'active',
          read: i % 2 === 0,
        },
      }),
    ),
  );

  await Promise.all(
    Array.from({ length: 5 }, (_, i) =>
      prisma.billingInvoice.create({
        data: {
          tenantId: tenant.id,
          amount: 1000 * (i + 1),
          status: i % 2 === 0 ? 'paid' : 'pending',
          dueDate: new Date(2025, 6, 1 + i),
        },
      }),
    ),
  );

  await Promise.all([
    prisma.companySetting.create({
      data: {
        tenantId: tenant.id,
        key: 'companyName',
        value: 'Acme HRIS',
        status: 'active',
      },
    }),
    prisma.companySetting.create({
      data: {
        tenantId: tenant.id,
        key: 'timezone',
        value: 'UTC',
        status: 'active',
      },
    }),
    prisma.companySetting.create({
      data: {
        tenantId: tenant.id,
        key: 'currency',
        value: 'USD',
        status: 'active',
      },
    }),
    prisma.companySetting.create({
      data: {
        tenantId: tenant.id,
        key: 'fiscalYearStart',
        value: 'January',
        status: 'active',
      },
    }),
    prisma.companySetting.create({
      data: {
        tenantId: tenant.id,
        key: 'leavePolicy',
        value: 'Standard',
        status: 'active',
      },
    }),
  ]);

  await prisma.auditLog.create({
    data: {
      tenantId: tenant.id,
      actorId: adminUser.id,
      action: 'seed.complete',
      entity: 'system',
      entityId: tenant.id,
    },
  });

  console.log('Seed complete:', {
    tenantId: tenant.id,
    adminEmail: 'admin@hris.com',
    password: 'password',
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
