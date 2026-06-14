import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { ListEntityDto } from '../../common/mappers/list-entity.mapper';

const REPORT_CATALOG: Array<{ id: string; name: string; status: string }> = [
  { id: 'employees', name: 'Employee Report', status: 'available' },
  { id: 'attendance', name: 'Attendance Report', status: 'available' },
  { id: 'payroll', name: 'Payroll Report', status: 'available' },
  { id: 'leave-usage', name: 'Leave Usage Report', status: 'available' },
  { id: 'turnover', name: 'Turnover Report', status: 'available' },
];

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  catalog(tenantId: string): ListEntityDto[] {
    const now = new Date().toISOString();
    return REPORT_CATALOG.map((r) => ({
      id: r.id,
      tenantId,
      name: r.name,
      status: r.status,
      createdAt: now,
      updatedAt: now,
    }));
  }

  async employees(tenantId: string) {
    const total = await this.prisma.employee.count({ where: { tenantId } });
    return { total };
  }

  async attendance(tenantId: string) {
    const total = await this.prisma.attendanceRecord.count({ where: { tenantId } });
    const present = await this.prisma.attendanceRecord.count({
      where: { tenantId, status: 'present' },
    });
    return { rate: total > 0 ? present / total : 0 };
  }

  async payroll(tenantId: string) {
    const records = await this.prisma.payrollRecord.findMany({
      where: { tenantId },
    });
    const total = records.reduce((sum, r) => sum + Number(r.amount), 0);
    return { total };
  }

  async leaveUsage(tenantId: string) {
    const count = await this.prisma.leaveRequest.count({
      where: { tenantId, status: 'approved' },
    });
    return { days: count * 2 };
  }

  async turnover(tenantId: string) {
    const total = await this.prisma.employee.count({ where: { tenantId } });
    const inactive = await this.prisma.employee.count({
      where: { tenantId, status: { in: ['inactive', 'resigned'] } },
    });
    return { rate: total > 0 ? inactive / total : 0 };
  }

  get(id: string) {
    return { id, report: 'summary' };
  }
}
