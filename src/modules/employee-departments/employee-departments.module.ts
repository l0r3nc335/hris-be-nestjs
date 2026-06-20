import { Module } from '@nestjs/common';
import { EmployeeDepartmentsController } from './employee-departments.controller';
import { EmployeeDepartmentsService } from './employee-departments.service';

@Module({
  controllers: [EmployeeDepartmentsController],
  providers: [EmployeeDepartmentsService],
})
export class EmployeeDepartmentsModule {}
