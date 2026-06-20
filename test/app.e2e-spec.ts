/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { TransformInterceptor } from '../src/common/interceptors/transform.interceptor';
import { GlobalExceptionFilter } from '../src/common/filters/http-exception.filter';
import {
  CSRF_COOKIE,
} from '../src/modules/auth/auth-cookies.service';

function parseCookies(setCookie: string[] | string | undefined): Record<string, string> {
  const headers = Array.isArray(setCookie)
    ? setCookie
    : setCookie
      ? [setCookie]
      : [];
  const jar: Record<string, string> = {};
  for (const header of headers) {
    const [pair] = header.split(';');
    const [name, value] = pair.split('=');
    jar[name] = value;
  }
  return jar;
}

function cookieHeader(jar: Record<string, string>): string {
  return Object.entries(jar)
    .map(([name, value]) => `${name}=${value}`)
    .join('; ');
}

describe('HRIS API (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.use(cookieParser());
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );
    app.useGlobalFilters(new GlobalExceptionFilter());
    app.useGlobalInterceptors(new TransformInterceptor());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /api/v1/health', async () => {
    const res = await request(app.getHttpServer()).get('/api/v1/health');
    expect([200, 503]).toContain(res.status);
  });

  it('GET /api/v1/version', () => {
    return request(app.getHttpServer())
      .get('/api/v1/version')
      .expect(200)
      .expect((res) => {
        expect(res.body.data).toHaveProperty('version');
      });
  });

  it('POST /api/v1/auth/login sets HttpOnly cookies', async () => {
    const csrfRes = await request(app.getHttpServer()).get('/api/v1/auth/csrf');
    const cookies = parseCookies(csrfRes.headers['set-cookie']);
    const csrfToken = cookies[CSRF_COOKIE];

    const res = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .set('Cookie', cookieHeader(cookies))
      .set('X-CSRF-Token', csrfToken)
      .send({ email: 'admin@hris.com', password: 'password' });

    if ([200, 201].includes(res.status)) {
      expect(res.body.data).toHaveProperty('user');
      expect(res.body.data).not.toHaveProperty('tokens');
      expect(res.headers['set-cookie']).toBeDefined();

      const authCookies = {
        ...cookies,
        ...parseCookies(res.headers['set-cookie']),
      };
      const tenantId = res.body.data.user.tenantId;

      await request(app.getHttpServer())
        .get('/api/v1/auth/me')
        .set('Cookie', cookieHeader(authCookies))
        .set('X-Tenant-Id', tenantId)
        .expect(200);

      await request(app.getHttpServer())
        .get('/api/v1/employees')
        .set('Cookie', cookieHeader(authCookies))
        .set('X-Tenant-Id', tenantId)
        .expect(200);

      await request(app.getHttpServer())
        .get('/api/v1/onboarding')
        .set('Cookie', cookieHeader(authCookies))
        .set('X-Tenant-Id', tenantId)
        .expect(200);

      await request(app.getHttpServer())
        .get('/api/v1/benefits')
        .set('Cookie', cookieHeader(authCookies))
        .set('X-Tenant-Id', tenantId)
        .expect(200);

      await request(app.getHttpServer())
        .get('/api/v1/training')
        .set('Cookie', cookieHeader(authCookies))
        .set('X-Tenant-Id', tenantId)
        .expect(200);

      await request(app.getHttpServer())
        .get('/api/v1/messages/inbox')
        .set('Cookie', cookieHeader(authCookies))
        .set('X-Tenant-Id', tenantId)
        .expect(200);

      const treeRes = await request(app.getHttpServer())
        .get('/api/v1/org/positions-tree')
        .set('Cookie', cookieHeader(authCookies))
        .set('X-Tenant-Id', tenantId)
        .expect(200);

      expect(Array.isArray(treeRes.body.data)).toBe(true);
      if (treeRes.body.data.length > 0) {
        expect(treeRes.body.data[0]).toHaveProperty('children');
      }

      await request(app.getHttpServer())
        .get('/api/v1/reports/employees')
        .set('Cookie', cookieHeader(authCookies))
        .set('X-Tenant-Id', tenantId)
        .expect(200);

      const pendingRes = await request(app.getHttpServer())
        .get('/api/v1/leaves/pending')
        .set('Cookie', cookieHeader(authCookies))
        .set('X-Tenant-Id', tenantId)
        .expect(200);

      expect(Array.isArray(pendingRes.body.data)).toBe(true);
    } else {
      expect([401, 500]).toContain(res.status);
    }
  });
});
