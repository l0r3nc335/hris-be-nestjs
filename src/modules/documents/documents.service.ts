import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { StorageService } from '../../storage/storage.service';
import { EntityNotFoundHelper } from '../../common/helpers/entity-not-found.helper';
import { mapDocument } from '../../common/mappers/domain.mappers';
import { ListEntityDto } from '../../common/mappers/list-entity.mapper';
import {
  restoreData,
  softDeleteData,
  tenantActiveWhere,
  tenantTrashedWhere,
} from '../../common/services/soft-delete-crud.helper';

@Injectable()
export class DocumentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
    private readonly helpers: EntityNotFoundHelper,
  ) {}

  private async findOrThrow(tenantId: string, id: string) {
    const record = await this.prisma.document.findFirst({
      where: { id, tenantId },
    });
    if (!record) this.helpers.throwNotFound('Document');
    return record;
  }

  async list(tenantId: string): Promise<ListEntityDto[]> {
    const records = await this.prisma.document.findMany({
      where: tenantActiveWhere(tenantId),
      orderBy: { createdAt: 'desc' },
    });
    return records.map(mapDocument);
  }

  async listTrashed(tenantId: string): Promise<ListEntityDto[]> {
    const records = await this.prisma.document.findMany({
      where: tenantTrashedWhere(tenantId),
      orderBy: { createdAt: 'desc' },
    });
    return records.map(mapDocument);
  }

  async get(tenantId: string, id: string): Promise<ListEntityDto> {
    return mapDocument(await this.findOrThrow(tenantId, id));
  }

  async byEmployee(tenantId: string, employeeId: string) {
    const records = await this.prisma.document.findMany({
      where: { ...tenantActiveWhere(tenantId), employeeId },
    });
    return records.map(mapDocument);
  }

  async upload(
    tenantId: string,
    file: Express.Multer.File,
    employeeId?: string,
  ) {
    const saved = await this.storage.saveFile(file);
    const record = await this.prisma.document.create({
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
    return mapDocument(record);
  }

  async softDelete(tenantId: string, id: string): Promise<ListEntityDto> {
    await this.findOrThrow(tenantId, id);
    const updated = await this.prisma.document.update({
      where: { id },
      data: softDeleteData(),
    });
    return mapDocument(updated);
  }

  async restore(tenantId: string, id: string): Promise<ListEntityDto> {
    const record = await this.prisma.document.findFirst({
      where: { id, ...tenantTrashedWhere(tenantId) },
    });
    if (!record) this.helpers.throwNotFound('Document');
    const updated = await this.prisma.document.update({
      where: { id },
      data: restoreData(),
    });
    return mapDocument(updated);
  }

  async remove(tenantId: string, id: string) {
    await this.findOrThrow(tenantId, id);
    await this.prisma.document.deleteMany({ where: { id, tenantId } });
    return { id, deleted: true };
  }
}
