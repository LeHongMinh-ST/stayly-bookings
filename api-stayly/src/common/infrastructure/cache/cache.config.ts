/**
 * Cache configuration for Redis
 * Exports cache manager configuration
 */

import { CacheModuleOptions } from '@nestjs/cache-manager';
import { ConfigService } from '@nestjs/config';
import { redisStore } from 'cache-manager-redis-yet';

/**
 * Get Redis cache configuration
 */
export const getCacheConfig = (
  configService: ConfigService,
): CacheModuleOptions => {
  return {
    store: redisStore,
    socket: {
      host: configService.get<string>('redis.host'),
      port: configService.get<number>('redis.port'),
    },
    password: configService.get<string>('redis.password'),
    ttl: configService.get<number>('redis.ttl')! * 1000,
  };
};
