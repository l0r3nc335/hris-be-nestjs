import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import {
  HealthCheck,
  HealthCheckService,
  PrismaHealthIndicator,
} from '@nestjs/terminus';
import { ConfigService } from '@nestjs/config';
import { Public } from '../common/decorators/public.decorator';
import { PrismaService } from '../database/prisma.service';
import { Inject } from '@nestjs/common';
import { REDIS_CLIENT } from '../cache/redis.module';
import Redis from 'ioredis';

@ApiTags('system')
@Controller()
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private prismaHealth: PrismaHealthIndicator,
    private prisma: PrismaService,
    private config: ConfigService,
    @Inject(REDIS_CLIENT) private redis: Redis,
  ) {}

  @Public()
  @Get('system/health-summary')
  async healthSummary() {
    const now = new Date().toISOString();
    let dbStatus = 'up';
    let redisStatus = 'down';

    try {
      await this.prisma.$queryRaw`SELECT 1`;
    } catch {
      dbStatus = 'down';
    }

    try {
      const pong = await this.redis.ping();
      redisStatus = pong === 'PONG' ? 'up' : 'degraded';
    } catch {
      redisStatus = 'down';
    }

    const tenantId = 'system';
    return [
      {
        id: 'database',
        tenantId,
        name: 'Database',
        status: dbStatus,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'redis',
        tenantId,
        name: 'Redis Cache',
        status: redisStatus,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'api',
        tenantId,
        name: 'API Server',
        status: 'up',
        createdAt: now,
        updatedAt: now,
      },
    ];
  }

  @Public()
  @Get('health')
  @HealthCheck()
  check() {
    return this.health.check([
      () => this.prismaHealth.pingCheck('database', this.prisma),
    ]);
  }

  @Public()
  @Get('metrics')
  async metrics() {
    let redisStatus = 'unknown';
    try {
      await this.redis.connect();
      const pong = await this.redis.ping();
      redisStatus = pong === 'PONG' ? 'up' : 'degraded';
    } catch {
      redisStatus = 'down';
    }
    return {
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      redis: redisStatus,
    };
  }

  @Public()
  @Get('status')
  status() {
    return { status: 'operational', timestamp: new Date().toISOString() };
  }

  @Public()
  @Get('version')
  version() {
    return {
      version: this.config.get<string>('apiVersion'),
      api: 'v1',
    };
  }
}
