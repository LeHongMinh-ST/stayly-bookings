/**
 * Logger Service
 * Provides structured logging using Pino
 */

import { Injectable, LoggerService as NestLoggerService } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';

@Injectable()
export class LoggerService implements NestLoggerService {
  constructor(private readonly pinoLogger: PinoLogger) {}

  /**
   * Log debug message
   */
  debug(message: any, context?: string): void {
    this.pinoLogger.debug({ context }, message);
  }

  /**
   * Log info message
   */
  log(message: any, context?: string): void {
    this.pinoLogger.info({ context }, message);
  }

  /**
   * Log warning message
   */
  warn(message: any, context?: string): void {
    this.pinoLogger.warn({ context }, message);
  }

  /**
   * Log error message
   */
  error(message: any, trace?: string, context?: string): void {
    this.pinoLogger.error({ context, trace }, message);
  }

  /**
   * Log verbose message
   */
  verbose(message: any, context?: string): void {
    this.pinoLogger.trace({ context }, message);
  }
}

