/**
 * Kafka configuration
 * Exports Kafka client configuration
 */

import { ConfigService } from '@nestjs/config';
import { KafkaOptions, Transport } from '@nestjs/microservices';

/**
 * Get Kafka microservice configuration
 */
export const getKafkaConfig = (configService: ConfigService): KafkaOptions => {
  return {
    transport: Transport.KAFKA,
    options: {
      client: {
        clientId: configService.get<string>('kafka.clientId', 'default-client'),
        brokers: configService.get<string[]>('kafka.brokers', ['localhost:9092']),
      },
      consumer: {
        groupId: configService.get<string>('kafka.groupId', 'default-group'),
      },
    },
  };
};

