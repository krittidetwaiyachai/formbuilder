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

const toPositiveInt = (value: string | undefined, fallback: number): number => {
  const parsed = Number.parseInt(value || '', 10);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
};

const shouldEnablePortFallback = (rawValue: string | undefined): boolean => {
  if (typeof rawValue === 'string') {
    return rawValue.toLowerCase() === 'true';
  }
  return process.env.NODE_ENV !== 'production';
};

const listenWithPortFallback = async (
  app: NestExpressApplication,
  initialPort: number,
  logger: Logger,
  enableFallback: boolean,
  maxRetries: number,
) => {
  let port = initialPort;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      await app.listen(port);
      return port;
    } catch (error) {
      const listenError = error as NodeJS.ErrnoException;
      const canRetry = enableFallback && listenError?.code === 'EADDRINUSE' && attempt < maxRetries;
      if (!canRetry) {
        throw error;
      }
      logger.warn(
        `Port ${port} is already in use. Retrying on ${port + 1} (${attempt + 1}/${maxRetries})`,
      );
      port += 1;
    }
  }

  throw new Error(`Failed to bind a port after ${maxRetries + 1} attempts`);
};

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
  const preferredPort = Number(configService.get<number>('PORT')) || 3000;
  const enablePortFallback = shouldEnablePortFallback(configService.get<string>('PORT_AUTO_INCREMENT'));
  const maxPortFallbackRetries = toPositiveInt(
    configService.get<string>('PORT_AUTO_INCREMENT_MAX'),
    10,
  );
  const activePort = await listenWithPortFallback(
    app,
    preferredPort,
    logger,
    enablePortFallback,
    maxPortFallbackRetries,
  );

  logger.log(`🚀 Application is running on: http://localhost:${activePort}`);
  if (allowedOrigins.length > 0) {
    logger.log(`Allowed Origins: ${allowedOrigins.join(', ')}`);
  }
}
bootstrap();
