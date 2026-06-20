import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
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
  list(@Query() query: PaginationQueryDto) {
    return this.service.list(query);
  }

  @Get('trashed')
  listTrashed(@Query() query: PaginationQueryDto) {
    return this.service.listTrashed(query);
  }

  @Post()
  create(@Body() body: { name: string; slug: string }) {
    return this.service.create(body);
  }

  @Patch(':id/soft-delete')
  softDelete(@Param('id') id: string) {
    return this.service.softDelete(id);
  }

  @Patch(':id/restore')
  restore(@Param('id') id: string) {
    return this.service.restore(id);
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

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
