import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Permissions } from '../../common/decorators/permissions.decorator';

@ApiTags('analytics')
@Controller('analytics')
@Permissions('reports:read')
export class AnalyticsController {
  @Get('dashboard')
  dashboard() {
    return {
      metrics: [
        { label: 'Employees', value: 128 },
        { label: 'Departments', value: 12 },
        { label: 'Pending Leave', value: 7 },
        { label: 'Open Positions', value: 4 },
      ],
    };
  }
}
