/**
 * Kafka Module
 * Configures Kafka microservice client for event publishing
 */

import { Module } from "@nestjs/common";
import { ClientsModule } from "@nestjs/microservices";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { getKafkaConfig } from "./kafka.config";
import { KafkaProducerService } from "./kafka.producer.service";
import { KafkaConsumerService } from "./kafka.consumer.service";

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: "KAFKA_SERVICE",
        imports: [ConfigModule],
        useFactory: getKafkaConfig,
        inject: [ConfigService],
      },
    ]),
  ],
  providers: [KafkaProducerService, KafkaConsumerService],
  exports: [KafkaProducerService, KafkaConsumerService],
})
export class KafkaModule {}
