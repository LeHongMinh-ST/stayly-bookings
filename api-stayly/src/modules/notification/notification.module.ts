/**
 * NotificationModule centralizes outbound communication (email/SMS/push)
 * and exposes a service for other bounded contexts.
 */
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigModule } from "@nestjs/config";

import { NotificationService } from "./application/services/notification.service";
import { NOTIFICATION_REPOSITORY } from "./domain/repositories/notification.repository.interface";
import { NotificationRepository } from "./infrastructure/persistence/repositories/notification.repository";
import { EMAIL_PROVIDER } from "./application/interfaces/email-provider.interface";
import { LoggerEmailProvider } from "./infrastructure/providers/email/logger-email.provider";
import { NOTIFICATION_SERVICE } from "./application/interfaces/notification-service.interface";
import { NotificationLogOrmEntity } from "./infrastructure/persistence/entities/notification-log.orm-entity";
import { PasswordResetNotificationHandler } from "./application/handlers/password-reset-notification.handler";
import { NotificationKafkaConsumer } from "./infrastructure/kafka/notification-kafka.consumer";

@Module({
  imports: [ConfigModule, TypeOrmModule.forFeature([NotificationLogOrmEntity])],
  providers: [
    { provide: NOTIFICATION_SERVICE, useClass: NotificationService },
    { provide: EMAIL_PROVIDER, useClass: LoggerEmailProvider },
    { provide: NOTIFICATION_REPOSITORY, useClass: NotificationRepository },
    PasswordResetNotificationHandler,
  ],
  controllers: [NotificationKafkaConsumer],
  exports: [NOTIFICATION_SERVICE],
})
export class NotificationModule {}
