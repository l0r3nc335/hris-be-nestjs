import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..', 'src', 'modules');

const modules = [
  { name: 'employees', entity: 'employees', perm: 'employees', extraRoutes: true },
  { name: 'departments', entity: 'departments', perm: 'departments' },
  { name: 'positions', entity: 'positions', perm: 'departments' },
  { name: 'attendance', entity: 'attendance', perm: 'employees' },
  { name: 'leave', entity: 'leaves', perm: 'employees', prefix: 'leaves' },
  { name: 'payroll', entity: 'payroll', perm: 'payroll' },
  { name: 'time-tracking', entity: 'time-logs', perm: 'employees', prefix: 'time-logs' },
  { name: 'interviews', entity: 'interviews', perm: 'employees' },
  { name: 'notifications', entity: 'notifications', perm: 'employees' },
];

for (const m of modules) {
  const dir = join(root, m.name);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  const ctrl = m.prefix ?? m.entity;
  const ENTITY = m.entity;
  const perm = m.perm;

  const service = `import { Injectable } from '@nestjs/common';
import { HrRecordsService } from '../../common/services/hr-records.service';

const ENTITY = '${ENTITY}';

@Injectable()
export class ${capitalize(camel(m.name))}Service {
  constructor(private readonly hr: HrRecordsService) {}

  list(tenantId: string) { return this.hr.list(tenantId, ENTITY); }
  get(tenantId: string, id: string) { return this.hr.getById(tenantId, ENTITY, id); }
  create(tenantId: string, body: { name?: string }) {
    return this.hr.createStub(tenantId, ENTITY, body.name ?? '${capitalize(ENTITY)}');
  }
  update(tenantId: string, id: string, body: { name?: string; status?: string }) {
    return this.hr.getById(tenantId, ENTITY, id).then((e) => ({
      ...e, name: body.name ?? e.name, status: body.status ?? e.status,
    }));
  }
  remove(_tenantId: string, id: string) { return { id, deleted: true }; }
  stub(tenantId: string, label: string) { return this.hr.stubEntity(tenantId, label); }
}
`;

  const controller = `import { Body, Controller, Delete, Get, Param, Patch, Post, Put } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ${capitalize(camel(m.name))}Service } from './${m.name}.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { RequestUser } from '../../common/types/request-user';

@ApiTags('${m.name}')
@Controller('${ctrl}')
@Permissions('${perm}:read')
export class ${capitalize(camel(m.name))}Controller {
  constructor(private readonly service: ${capitalize(camel(m.name))}Service) {}

  @Get()
  list(@CurrentUser() user: RequestUser) { return this.service.list(user.tenantId); }

  @Get(':id')
  get(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    return this.service.get(user.tenantId, id);
  }

  @Post()
  @Permissions('${perm}:write')
  create(@CurrentUser() user: RequestUser, @Body() body: Record<string, string>) {
    return this.service.create(user.tenantId, body);
  }

  @Put(':id')
  @Permissions('${perm}:write')
  update(@CurrentUser() user: RequestUser, @Param('id') id: string, @Body() body: Record<string, string>) {
    return this.service.update(user.tenantId, id, body);
  }

  @Patch(':id')
  @Permissions('${perm}:write')
  patch(@CurrentUser() user: RequestUser, @Param('id') id: string, @Body() body: Record<string, string>) {
    return this.service.update(user.tenantId, id, body);
  }

  @Delete(':id')
  @Permissions('${perm}:write')
  remove(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    return this.service.remove(user.tenantId, id);
  }
}
`;

  const mod = `import { Module } from '@nestjs/common';
import { ${capitalize(camel(m.name))}Controller } from './${m.name}.controller';
import { ${capitalize(camel(m.name))}Service } from './${m.name}.service';

@Module({
  controllers: [${capitalize(camel(m.name))}Controller],
  providers: [${capitalize(camel(m.name))}Service],
})
export class ${capitalize(camel(m.name))}Module {}
`;

  writeFileSync(join(dir, `${m.name}.service.ts`), service);
  writeFileSync(join(dir, `${m.name}.controller.ts`), controller);
  writeFileSync(join(dir, `${m.name}.module.ts`), mod);
}

function camel(s) { return s.replace(/-([a-z])/g, (_, c) => c.toUpperCase()); }
function capitalize(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

console.log('Generated', modules.length, 'modules');
