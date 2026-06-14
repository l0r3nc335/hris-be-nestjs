import { Module } from '@nestjs/common';
import { DepartmentsModule } from '../departments/departments.module';
import { OrganizationController } from './organization.controller';
import { OrganizationService } from './organization.service';

@Module({
  imports: [DepartmentsModule],
  controllers: [OrganizationController],
  providers: [OrganizationService],
})
export class OrganizationModule {}
