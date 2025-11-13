/**
 * Kafka Consumer Service
 * Base service for consuming events from Kafka topics
 */

import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

@Injectable()
export class KafkaConsumerService {
  private readonly logger = new Logger(KafkaConsumerService.name);

  /**
   * Handle incoming Kafka message
   * This is a base implementation, should be extended by specific consumers
   */
  @OnEvent('kafka.message')
  handleMessage(payload: any) {
    this.logger.debug(`Received Kafka message: ${JSON.stringify(payload)}`);
    // Base implementation - should be overridden by specific handlers
  }
}
