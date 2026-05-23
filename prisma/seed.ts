import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const PERMISSIONS = [
  'users:read',
  'users:write',
  'employees:read',
  'employees:write',
  'departments:read',
  'leave:approve',
  'payroll:read',
  'payroll:run',
  'roles:manage',
  'tenants:manage',
  'audit:read',
  'settings:write',
  'reports:read',
  'billing:read',
];

const ENTITY_TYPES = [
  'users',
  'employees',
  'departments',
  'positions',
  'attendance',
  'leaves',
  'payroll',
  'time-logs',
  'recruitment-jobs',
  'recruitment-applicants',
  'interviews',
  'performance-reviews',
  'documents',
  'notifications',
  'billing-invoices',
  'leave-types',
  'salary-structures',
];

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

  await prisma.hrRecord.deleteMany({ where: { tenantId: tenant.id } });

  for (const entityType of ENTITY_TYPES) {
    const prefix = entityType.replace(/-/g, ' ');
    for (let i = 1; i <= 5; i++) {
      await prisma.hrRecord.create({
        data: {
          tenantId: tenant.id,
          entityType,
          name: `${prefix} ${i}`,
          status: 'active',
        },
      });
    }
  }

  console.log('Seed complete:', {
    tenantId: tenant.id,
    adminEmail: 'admin@hris.com',
    password: 'password',
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
