import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { Logger } from 'nestjs-pino';
import { AppModule } from './app.module';
import { ACCESS_COOKIE } from './modules/auth/auth-cookies.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  app.useLogger(app.get(Logger));

  const config = app.get(ConfigService);
  app.setGlobalPrefix('api/v1');
  app.use(cookieParser());
  app.use(helmet());
  app.enableCors({
    origin: config.get<string[]>('corsOrigins'),
    credentials: true,
    allowedHeaders: ['Content-Type', 'X-Tenant-Id', 'X-CSRF-Token'],
    exposedHeaders: ['Set-Cookie'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  const swaggerConfig = new DocumentBuilder()
    .setTitle('HRIS API')
    .setDescription('Enterprise HRIS REST API')
    .setVersion('1.0')
    .addCookieAuth(ACCESS_COOKIE)
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  const port = config.get<number>('port') ?? 3000;
  await app.listen(port);
}
void bootstrap();
