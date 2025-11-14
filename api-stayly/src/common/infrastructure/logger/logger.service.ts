/**
 * Logger Service
 * Provides structured logging using Pino
 */

import { Injectable, LoggerService as NestLoggerService } from "@nestjs/common";
import { PinoLogger } from "nestjs-pino";

const normalizeMessage = (message: unknown): string => {
  if (typeof message === "string") {
    return message;
  }
  try {
    return JSON.stringify(message);
  } catch {
    return String(message);
  }
};

@Injectable()
export class LoggerService implements NestLoggerService {
  constructor(private readonly pinoLogger: PinoLogger) {}

  /**
   * Log debug message
   */
  debug(message: unknown, context?: string): void {
    this.pinoLogger.debug({ context }, normalizeMessage(message));
  }

  /**
   * Log info message
   */
  log(message: unknown, context?: string): void {
    this.pinoLogger.info({ context }, normalizeMessage(message));
  }

  /**
   * Log warning message
   */
  warn(message: unknown, context?: string): void {
    this.pinoLogger.warn({ context }, normalizeMessage(message));
  }

  /**
   * Log error message
   */
  error(message: unknown, trace?: string, context?: string): void {
    this.pinoLogger.error({ context, trace }, normalizeMessage(message));
  }

  /**
   * Log verbose message
   */
  verbose(message: unknown, context?: string): void {
    this.pinoLogger.trace({ context }, normalizeMessage(message));
  }
}
