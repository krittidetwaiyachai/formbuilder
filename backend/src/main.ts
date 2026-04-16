import { NestFactory, Reflector } from '@nestjs/core';
import { ClassSerializerInterceptor, ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import helmet from 'helmet';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import * as express from 'express';
function normalizeOriginList(rawOrigins: string | undefined) {
  if (!rawOrigins) {
    return [];
  }
  return [...new Set(
    rawOrigins.
    split(',').
    map((origin) => origin.trim().replace(/^"(.*)"$/, '$1')).
    filter(Boolean)
  )];
}
function toSocketOrigin(origin: string) {
  if (origin.startsWith('https://')) {
    return origin.replace('https://', 'wss://');
  }
  if (origin.startsWith('http://')) {
    return origin.replace('http://', 'ws://');
  }
  return origin;
}
async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app.get(ConfigService);
  const trustProxyHopsRaw = configService.get<string>('TRUST_PROXY_HOPS');
  const trustProxyHops = Number.isFinite(Number(trustProxyHopsRaw))
    ? Math.max(0, Number(trustProxyHopsRaw))
    : 0;
  app.set('trust proxy', trustProxyHops);
  app.use(require('compression')());
  app.use(express.json({ limit: '5mb' }));
  app.use(express.urlencoded({ limit: '5mb', extended: true }));
  app.useStaticAssets(join(process.cwd(), '..', 'frontend', 'public'), {
    prefix: '/'
  });
  const logger = new Logger('Bootstrap');
  const allowedOrigins = normalizeOriginList(configService.get<string>('FRONTEND_URL'));
  const connectOrigins = [
  "'self'",
  ...allowedOrigins,
  ...allowedOrigins.map(toSocketOrigin),
  'http://localhost:*',
  'ws://localhost:*',
  'https:'];
  app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: connectOrigins
      }
    }
  }));
  app.enableCors({
    origin: allowedOrigins.length > 0 ? allowedOrigins : ['http://localhost:5173'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'Idempotency-Key',
      'X-Request-Id',
      'X-CSRF-Token',
    ]
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true
    })
  );
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
  app.setGlobalPrefix('api');
  const port = configService.get<number>('PORT') || 3000;
  await app.listen(port);
  logger.log(`🚀 Application is running on: http://localhost:${port}`);
  if (allowedOrigins.length > 0) {
    logger.log(`Allowed Origins: ${allowedOrigins.join(', ')}`);
  }
}
bootstrap();
