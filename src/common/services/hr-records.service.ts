import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { HrEntityDto } from '../types/hr-entity';
import { AppException, ErrorCodes } from '../errors/app.exception';
import { HttpStatus } from '@nestjs/common';

@Injectable()
export class HrRecordsService {
  constructor(private readonly prisma: PrismaService) {}

  toDto(record: {
    id: string;
    tenantId: string;
    name: string;
    status: string;
    createdAt: Date;
    updatedAt: Date;
  }): HrEntityDto {
    return {
      id: record.id,
      tenantId: record.tenantId,
      name: record.name,
      status: record.status,
      createdAt: record.createdAt.toISOString(),
      updatedAt: record.updatedAt.toISOString(),
    };
  }

  async list(tenantId: string, entityType: string): Promise<HrEntityDto[]> {
    const records = await this.prisma.hrRecord.findMany({
      where: { tenantId, entityType },
      orderBy: { createdAt: 'desc' },
    });
    return records.map((r) => this.toDto(r));
  }

  async getById(
    tenantId: string,
    entityType: string,
    id: string,
  ): Promise<HrEntityDto> {
    const record = await this.prisma.hrRecord.findFirst({
      where: { id, tenantId, entityType },
    });
    if (!record) {
      throw new AppException(
        ErrorCodes.NOT_FOUND,
        `${entityType} not found`,
        HttpStatus.NOT_FOUND,
      );
    }
    return this.toDto(record);
  }

  async createStub(
    tenantId: string,
    entityType: string,
    name: string,
    status = 'active',
  ): Promise<HrEntityDto> {
    const record = await this.prisma.hrRecord.create({
      data: { tenantId, entityType, name, status },
    });
    return this.toDto(record);
  }

  stubEntity(tenantId: string, name: string, index = 1): HrEntityDto {
    const now = new Date().toISOString();
    return {
      id: `${name.toLowerCase()}-stub-${index}`,
      tenantId,
      name: `${name} ${index}`,
      status: 'active',
      createdAt: now,
      updatedAt: now,
    };
  }
}
