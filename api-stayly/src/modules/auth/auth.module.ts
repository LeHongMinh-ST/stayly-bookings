/**
 * Authentication Module
 * Coordinates login, token lifecycle, and RBAC utilities
 */

import { Module } from "@nestjs/common";
import { CqrsModule } from "@nestjs/cqrs";
import { JwtModule } from "@nestjs/jwt";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { PassportModule } from "@nestjs/passport";
import { TypeOrmModule } from "@nestjs/typeorm";
import { SecurityModule } from "../../common/infrastructure/security/security.module";
import { UserManagementModule } from "../user-management/user.module";
import { CustomerManagementModule } from "../customer-management/customer.module";
import { AuthenticateUserHandler } from "./application/commands/handlers/authenticate-user.handler";
import { RefreshTokenHandler } from "./application/commands/handlers/refresh-token.handler";
import { RevokeSessionHandler } from "./application/commands/handlers/revoke-session.handler";
import { TOKEN_SERVICE } from "../../common/application/interfaces/token-service.interface";
import { SESSION_REPOSITORY } from "./domain/repositories/session.repository.interface";
import { SessionOrmEntity } from "./infrastructure/persistence/entities/session.orm-entity";
import { SessionRepository } from "./infrastructure/persistence/repositories/session.repository";
import { AuthController } from "./presentation/controllers/auth.controller";
import { JwtTokenService } from "./infrastructure/services/jwt-token.service";
import { JwtStrategy } from "../../common/strategies/jwt.strategy";

const commandHandlers = [
  AuthenticateUserHandler,
  RefreshTokenHandler,
  RevokeSessionHandler,
];

@Module({
  imports: [
    CqrsModule,
    SecurityModule,
    UserManagementModule,
    CustomerManagementModule,
    TypeOrmModule.forFeature([SessionOrmEntity]),
    PassportModule.register({ defaultStrategy: "jwt" }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>("jwt.secret"),
        signOptions: {
          expiresIn: configService.get<string>("jwt.expiresIn") as
            | `${number}${"s" | "m" | "h" | "d"}`
            | number,
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [
    ...commandHandlers,
    JwtStrategy,
    { provide: SESSION_REPOSITORY, useClass: SessionRepository },
    { provide: TOKEN_SERVICE, useClass: JwtTokenService },
  ],
  exports: [TOKEN_SERVICE, SESSION_REPOSITORY, PassportModule],
})
export class AuthModule { }
