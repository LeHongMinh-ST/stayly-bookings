/**
 * Logger Module
 * Configures Pino logger
 */

import { Module } from "@nestjs/common";
import { LoggerModule as PinoLoggerModule } from "nestjs-pino";
import { ConfigModule, ConfigService } from "@nestjs/config";
import type { IncomingMessage, ServerResponse } from "http";

type RequestWithId = IncomingMessage & { id?: string };
type ResponseWithStatus = ServerResponse & { statusCode?: number };

@Module({
  imports: [
    PinoLoggerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const isDevelopment = configService.get("app.env") === "development";
        const logLevel = (
          configService.get<string>("logging.level") ?? "info"
        ).toLowerCase();

        return {
          pinoHttp: {
            level: logLevel,
            transport: isDevelopment
              ? {
                  target: "pino-pretty",
                  options: {
                    colorize: true,
                    singleLine: false,
                    translateTime: "SYS:standard",
                  },
                }
              : undefined,
            serializers: {
              req: (req: RequestWithId) => ({
                id: req.id,
                method: req.method,
                url: req.url,
              }),
              res: (res: ResponseWithStatus) => ({
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
