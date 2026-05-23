import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { TenantsService } from './tenants.service';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { SkipTenant } from '../../common/decorators/skip-tenant.decorator';

@ApiTags('tenants')
@Controller('tenants')
@Permissions('tenants:manage')
@SkipTenant()
export class TenantsController {
  constructor(private readonly service: TenantsService) {}

  @Get()
  list() {
    return this.service.list();
  }

  @Post()
  create(@Body() body: { name: string; slug: string }) {
    return this.service.create(body);
  }

  @Post(':id/suspend')
  suspend(@Param('id') id: string) {
    return this.service.suspend(id);
  }

  @Post(':id/reactivate')
  reactivate(@Param('id') id: string) {
    return this.service.reactivate(id);
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.service.get(id);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() body: { name?: string; status?: string },
  ) {
    return this.service.update(id, body);
  }
}
