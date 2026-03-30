import { Global, Logger, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { REDIS_CLIENT } from './redis.constants';
import { RedisService } from './redis.service';

@Global()
@Module({
  providers: [
    {
      provide: REDIS_CLIENT,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const logger = new Logger('RedisModule');
        const redisUrl = configService.get<string>('REDIS_URL');

        if (!redisUrl) {
          logger.warn(
            'REDIS_URL is not configured. Falling back to in-memory rate limiting for this process.'
          );
          return null;
        }

        const client = new Redis(redisUrl, {
          maxRetriesPerRequest: 2,
          enableReadyCheck: true,
          lazyConnect: false
        });

        client.on('error', (error) => {
          logger.error(`Redis connection error: ${error.message}`);
        });

        client.on('ready', () => {
          logger.log('Redis client connected');
        });

        return client;
      }
    },
    RedisService
  ],
  exports: [REDIS_CLIENT, RedisService]
})
export class RedisModule {}
