import 'reflect-metadata';
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../app.module';

async function bootstrap() {
  const logger = new Logger('Seeder');
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn', 'log'],
  });

  logger.log('Running database seeders...');

  await app.close();
}

bootstrap().catch((error) => {
  // eslint-disable-next-line no-console
  console.error('Seeding failed:', error);
  process.exit(1);
});
