import {
  HttpStatus,
  Injectable,
  HttpException,
  Logger
} from '@nestjs/common';
import { RedisService } from '../common/redis/redis.service';

interface InMemoryCounter {
  count: number;
  expiresAt: number;
}

@Injectable()
export class RedisRateLimitService {
  private readonly logger = new Logger(RedisRateLimitService.name);
  private readonly memoryCounters = new Map<string, InMemoryCounter>();
  private warnedAboutFallback = false;

  constructor(private readonly redisService: RedisService) {}

  async consume(key: string, limit: number, ttlSeconds: number) {
    const client = this.redisService.getClient();

    if (!client) {
      return this.consumeInMemory(key, limit, ttlSeconds);
    }

    const current = await client.incr(key);

    if (current === 1) {
      await client.expire(key, ttlSeconds);
    }

    const retryAfter = await client.ttl(key);

    if (current > limit) {
      throw new HttpException(
        {
          code: 'RATE_LIMITED',
          retryAfter: retryAfter > 0 ? retryAfter : ttlSeconds,
          message: 'Too many requests. Please try again later.'
        },
        HttpStatus.TOO_MANY_REQUESTS
      );
    }

    return {
      current,
      retryAfter: retryAfter > 0 ? retryAfter : ttlSeconds,
      remaining: Math.max(limit - current, 0)
    };
  }

  async acquireCooldown(key: string, ttlSeconds: number): Promise<boolean> {
    const client = this.redisService.getClient();

    if (!client) {
      return this.acquireCooldownInMemory(key, ttlSeconds);
    }

    const result = await client.set(key, '1', 'EX', ttlSeconds, 'NX');
    return result === 'OK';
  }

  private consumeInMemory(key: string, limit: number, ttlSeconds: number) {
    this.logFallbackWarning();
    this.purgeExpiredCounters();

    const now = Date.now();
    const existing = this.memoryCounters.get(key);

    if (!existing || existing.expiresAt <= now) {
      const counter: InMemoryCounter = {
        count: 1,
        expiresAt: now + ttlSeconds * 1000
      };
      this.memoryCounters.set(key, counter);

      return {
        current: 1,
        retryAfter: ttlSeconds,
        remaining: Math.max(limit - 1, 0)
      };
    }

    existing.count += 1;
    const retryAfter = Math.max(
      Math.ceil((existing.expiresAt - now) / 1000),
      1
    );

    if (existing.count > limit) {
      throw new HttpException(
        {
          code: 'RATE_LIMITED',
          retryAfter,
          message: 'Too many requests. Please try again later.'
        },
        HttpStatus.TOO_MANY_REQUESTS
      );
    }

    return {
      current: existing.count,
      retryAfter,
      remaining: Math.max(limit - existing.count, 0)
    };
  }

  private acquireCooldownInMemory(key: string, ttlSeconds: number): boolean {
    this.logFallbackWarning();
    this.purgeExpiredCounters();

    const now = Date.now();
    const existing = this.memoryCounters.get(key);

    if (existing && existing.expiresAt > now) {
      return false;
    }

    this.memoryCounters.set(key, {
      count: 1,
      expiresAt: now + ttlSeconds * 1000
    });

    return true;
  }

  private purgeExpiredCounters() {
    const now = Date.now();

    for (const [key, value] of this.memoryCounters.entries()) {
      if (value.expiresAt <= now) {
        this.memoryCounters.delete(key);
      }
    }
  }

  private logFallbackWarning() {
    if (this.warnedAboutFallback) {
      return;
    }

    this.warnedAboutFallback = true;
    this.logger.warn(
      'Redis is unavailable. Using in-memory rate limiting for this process only.'
    );
  }
}
