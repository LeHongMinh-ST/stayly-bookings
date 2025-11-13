/**
 * Database configuration for TypeORM
 * Exports TypeORM configuration object
 */

import { join } from 'path';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

/**
 * Get TypeORM configuration from environment variables
 */
export const getDatabaseConfig = (
  configService: ConfigService,
): TypeOrmModuleOptions => {
  return {
    type: 'postgres',
    host: configService.get<string>('database.host'),
    port: configService.get<number>('database.port'),
    username: configService.get<string>('database.user'),
    password: configService.get<string>('database.password'),
    database: configService.get<string>('database.name'),
    synchronize: configService.get<boolean>('database.synchronize'),
    logging: configService.get<boolean>('database.logging'),
    entities: [join(__dirname, '../../../modules/**/*.orm-entity{.ts,.js}')],
    migrations: [join(__dirname, '../../../migrations/*{.ts,.js}')],
    migrationsRun: false,
    migrationsTableName: 'migrations',
    extra: {
      max: 20, // Maximum number of connections in pool
      connectionTimeoutMillis: 2000,
    },
  };
};
