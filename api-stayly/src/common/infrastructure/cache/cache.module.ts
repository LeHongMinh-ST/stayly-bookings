/**
 * Cache Module
 * Configures Redis cache manager
 */

import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { getCacheConfig } from './cache.config';

@Module({
  imports: [
    CacheModule.registerAsync({
      imports: [ConfigModule],
      useFactory: getCacheConfig,
      inject: [ConfigService],
      isGlobal: true, // Make cache available globally
    }),
  ],
  exports: [CacheModule],
})
export class CacheModuleConfig {}
