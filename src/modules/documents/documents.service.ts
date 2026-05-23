import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { StorageService } from '../../storage/storage.service';
import { HrRecordsService } from '../../common/services/hr-records.service';

@Injectable()
export class DocumentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
    private readonly hr: HrRecordsService,
  ) {}

  list(tenantId: string) {
    return this.prisma.document.findMany({ where: { tenantId } });
  }

  get(tenantId: string, id: string) {
    return this.prisma.document.findFirst({ where: { id, tenantId } });
  }

  byEmployee(tenantId: string, employeeId: string) {
    return this.prisma.document.findMany({ where: { tenantId, employeeId } });
  }

  async upload(
    tenantId: string,
    file: Express.Multer.File,
    employeeId?: string,
  ) {
    const saved = await this.storage.saveFile(file);
    return this.prisma.document.create({
      data: {
        tenantId,
        employeeId,
        filename: saved.filename,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: saved.size,
        path: saved.path,
      },
    });
  }

  async remove(tenantId: string, id: string) {
    await this.prisma.document.deleteMany({ where: { id, tenantId } });
    return { id, deleted: true };
  }
}
