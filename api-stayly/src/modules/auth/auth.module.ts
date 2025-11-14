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
import { UserModule } from "../user/user.module";
import { CustomerModule } from "../customer/customer.module";
import { RbacModule } from "../rbac/rbac.module";
import { AuthenticateUserHandler } from "./application/commands/handlers/authenticate-user.handler";
import { AuthenticateCustomerHandler } from "./application/commands/handlers/authenticate-customer.handler";
import { RefreshTokenHandler } from "./application/commands/handlers/refresh-token.handler";
import { RevokeSessionHandler } from "./application/commands/handlers/revoke-session.handler";
import { TOKEN_SERVICE } from "../../common/application/interfaces/token-service.interface";
import { SESSION_REPOSITORY } from "./domain/repositories/session.repository.interface";
import { SessionOrmEntity } from "./infrastructure/persistence/entities/session.orm-entity";
import { SessionRepository } from "./infrastructure/persistence/repositories/session.repository";
import { UserAuthController } from "./presentation/controllers/auth.controller";
import { CustomerAuthController } from "./presentation/controllers/customer-auth.controller";
import { JwtTokenService } from "./infrastructure/services/jwt-token.service";
import { JwtUserStrategy } from "../../common/strategies/jwt-user.strategy";
import { JwtCustomerStrategy } from "../../common/strategies/jwt-customer.strategy";
import { CustomerAuthenticationAdapter } from "./infrastructure/adapters/customer-authentication.adapter";
import { UserAuthenticationAdapter } from "./infrastructure/adapters/user-authentication.adapter";
import { UserRolePermissionQueryAdapter } from "./infrastructure/adapters/user-role-permission-query.adapter";
import { CUSTOMER_AUTHENTICATION_SERVICE } from "./application/interfaces/customer-authentication.service.interface";
import { USER_AUTHENTICATION_SERVICE } from "./application/interfaces/user-authentication.service.interface";
import { USER_ROLE_PERMISSION_QUERY_SERVICE } from "./application/interfaces/user-role-permission-query.service.interface";

const commandHandlers = [
  AuthenticateUserHandler,
  AuthenticateCustomerHandler,
  RefreshTokenHandler,
  RevokeSessionHandler,
];

@Module({
  imports: [
    CqrsModule,
    SecurityModule,
    UserModule,
    CustomerModule,
    RbacModule, // Import RbacModule to access USER_ROLE_PERMISSION_QUERY_PORT
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
  controllers: [UserAuthController, CustomerAuthController],
  providers: [
    ...commandHandlers,
    JwtUserStrategy,
    JwtCustomerStrategy,
    { provide: SESSION_REPOSITORY, useClass: SessionRepository },
    { provide: TOKEN_SERVICE, useClass: JwtTokenService },
    // Adapters use services from other modules, not repositories directly
    // Services are exported from modules and provide what other modules need
    {
      provide: CUSTOMER_AUTHENTICATION_SERVICE,
      useClass: CustomerAuthenticationAdapter,
    },
    {
      provide: USER_AUTHENTICATION_SERVICE,
      useClass: UserAuthenticationAdapter,
    },
    {
      provide: USER_ROLE_PERMISSION_QUERY_SERVICE,
      useClass: UserRolePermissionQueryAdapter,
    },
  ],
  exports: [TOKEN_SERVICE, SESSION_REPOSITORY, PassportModule],
})
export class AuthModule {}
