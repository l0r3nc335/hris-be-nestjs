import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PerformanceService } from './performance.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { RequestUser } from '../../common/types/request-user';

@ApiTags('performance')
@Controller('performance')
@Permissions('employees:read')
export class PerformanceController {
  constructor(private readonly service: PerformanceService) {}

  @Get('reviews')
  list(@CurrentUser() user: RequestUser) {
    return this.service.list(user.tenantId);
  }

  @Get('ratings/:employeeId')
  ratings(@Param('employeeId') employeeId: string) {
    return this.service.ratings('', employeeId);
  }

  @Post('reviews')
  create(
    @CurrentUser() user: RequestUser,
    @Body() body: Record<string, string>,
  ) {
    return this.service.create(user.tenantId, body);
  }

  @Post('reviews/:id/submit')
  submit(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    return this.service.submit(user.tenantId, id);
  }

  @Post('reviews/:id/approve')
  approve(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    return this.service.approve(user.tenantId, id);
  }

  @Get('reviews/:id')
  get(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    return this.service.get(user.tenantId, id);
  }

  @Put('reviews/:id')
  @Patch('reviews/:id')
  update(
    @CurrentUser() user: RequestUser,
    @Param('id') id: string,
    @Body() body: Record<string, string>,
  ) {
    return this.service.update(user.tenantId, id, body);
  }

  @Delete('reviews/:id')
  remove(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    return this.service.remove(user.tenantId, id);
  }
}
