/**
 * Root Application Module
 * Imports all infrastructure modules and common modules
 */

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD, APP_INTERCEPTOR, APP_FILTER, APP_PIPE } from '@nestjs/core';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import configuration from './config/configuration';

// Infrastructure modules
import { DatabaseModule } from './common/infrastructure/database/database.module';
import { CacheModuleConfig } from './common/infrastructure/cache/cache.module';
import { KafkaModule } from './common/infrastructure/kafka/kafka.module';
import { LoggerModuleConfig } from './common/infrastructure/logger/logger.module';

// Guards
import { RolesGuard } from './common/guards/roles.guard';
import { PermissionsGuard } from './common/guards/permissions.guard';

// Interceptors
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

// Filters
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

// Pipes
import { ValidationPipe } from './common/pipes/validation.pipe';

// Bounded Context Modules
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { CustomerModule } from './modules/customer/customer.module';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      envFilePath: ['.env.local', '.env'],
    }),

    // Event Emitter for Domain Events
    EventEmitterModule.forRoot(),

    // Infrastructure modules
    DatabaseModule,
    CacheModuleConfig,
    KafkaModule,
    LoggerModuleConfig,

    // Bounded contexts
    AuthModule,
    UserModule,
    CustomerModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,

    // Global guards
    // Note: JWT authentication guards are applied per-controller (JwtUserGuard or JwtCustomerGuard)
    // to ensure proper separation between admin and customer endpoints
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    {
      provide: APP_GUARD,
      useClass: PermissionsGuard,
    },

    // Global interceptors
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
    // Cache interceptor is optional - can be applied per route
    // {
    //   provide: APP_INTERCEPTOR,
    //   useClass: CacheInterceptor,
    // },

    // Global filters
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },

    // Global pipes
    {
      provide: APP_PIPE,
      useClass: ValidationPipe,
    },
  ],
})
export class AppModule {}
