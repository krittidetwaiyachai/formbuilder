import { Inject, Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';
import { REDIS_CLIENT } from './redis.constants';
@Injectable()export class
RedisService implements OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  constructor(@Inject(REDIS_CLIENT)private readonly client: Redis | null) {}
  getClient(): Redis | null {
    return this.client;
  }
  async onModuleDestroy() {
    if (!this.client) {
      return;
    }
    try {
      if (this.client.status !== 'end') {
        await this.client.quit();
      }
    } catch (error) {
      this.logger.warn('Failed to close Redis cleanly');
    }
  }
}