/**
 * Logger Module
 * Configures Pino logger
 */

import { Module } from '@nestjs/common';
import { LoggerModule as PinoLoggerModule } from 'nestjs-pino';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    PinoLoggerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const isDevelopment = configService.get('app.env') === 'development';
        const logLevel = configService.get('logging.level') || 'info';

        return {
          pinoHttp: {
            level: logLevel,
            transport: isDevelopment
              ? {
                  target: 'pino-pretty',
                  options: {
                    colorize: true,
                    singleLine: false,
                    translateTime: 'SYS:standard',
                  },
                }
              : undefined,
            serializers: {
              req: (req: any) => ({
                id: req.id,
                method: req.method,
                url: req.url,
              }),
              res: (res: any) => ({
                statusCode: res.statusCode,
              }),
            },
          },
        };
      },
    }),
  ],
})
export class LoggerModuleConfig {}
