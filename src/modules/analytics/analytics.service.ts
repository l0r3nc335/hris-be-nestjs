import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async dashboard(tenantId: string) {
    const [employees, departments, pendingLeave, openPositions] =
      await Promise.all([
        this.prisma.employee.count({ where: { tenantId, status: 'active' } }),
        this.prisma.department.count({ where: { tenantId, status: 'active' } }),
        this.prisma.leaveRequest.count({
          where: { tenantId, status: 'pending' },
        }),
        this.prisma.jobPosting.count({
          where: { tenantId, status: 'open' },
        }),
      ]);

    return {
      metrics: [
        { label: 'Employees', value: employees },
        { label: 'Departments', value: departments },
        { label: 'Pending Leave', value: pendingLeave },
        { label: 'Open Positions', value: openPositions },
      ],
    };
  }
}
