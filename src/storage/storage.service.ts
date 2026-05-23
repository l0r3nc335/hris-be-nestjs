import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { mkdir, writeFile } from 'fs/promises';
import { join } from 'path';
import { randomUUID } from 'crypto';

@Injectable()
export class StorageService {
  private readonly uploadDir: string;

  constructor(config: ConfigService) {
    this.uploadDir = config.get<string>('uploadDir') ?? './uploads';
  }

  async saveFile(
    file: Express.Multer.File,
  ): Promise<{ filename: string; path: string; size: number }> {
    await mkdir(this.uploadDir, { recursive: true });
    const filename = `${randomUUID()}-${file.originalname}`;
    const filePath = join(this.uploadDir, filename);
    await writeFile(filePath, file.buffer);
    return { filename, path: filePath, size: file.size };
  }
}
