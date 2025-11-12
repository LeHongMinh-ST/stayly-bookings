/**
 * Kafka Producer Service
 * Base service for publishing events to Kafka topics
 */

import { Injectable, Inject, OnModuleInit } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';

@Injectable()
export class KafkaProducerService implements OnModuleInit {
  constructor(
    @Inject('KAFKA_SERVICE') private readonly kafkaClient: ClientKafka,
  ) {}

  async onModuleInit() {
    // Connect to Kafka on module initialization
    await this.kafkaClient.connect();
  }

  /**
   * Publish event to Kafka topic
   * @param topic - Kafka topic name
   * @param event - Event data
   */
  async publish(topic: string, event: any): Promise<void> {
    await this.kafkaClient.emit(topic, {
      key: event.aggregateId || event.id,
      value: JSON.stringify(event),
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Publish multiple events to Kafka topic
   * @param topic - Kafka topic name
   * @param events - Array of event data
   */
  async publishBatch(topic: string, events: any[]): Promise<void> {
    const promises = events.map((event) => this.publish(topic, event));
    await Promise.all(promises);
  }
}

