/**
 * Database Seeding Script
 * Runs all seeders to populate initial data
 */
import "reflect-metadata";
import { Logger } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "../../app.module";
import { RolePermissionSeedService } from "../../modules/rbac/infrastructure/persistence/seeds/role-permission-seed.service";
import { DefaultUsersSeedService } from "../../modules/user/infrastructure/persistence/seeds/default-users-seed.service";
import { DefaultCustomersSeedService } from "../../modules/customer/infrastructure/persistence/seeds/default-customers-seed.service";
import { DefaultAccommodationsSeedService } from "../../modules/accommodation/infrastructure/persistence/seeds/default-accommodations-seed.service";

async function bootstrap() {
  const logger = new Logger("Seeder");
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ["error", "warn", "log"],
  });

  try {
    logger.log("Starting database seeding...");

    // 1. Seed roles and permissions first (required for users)
    logger.log("Seeding roles and permissions...");
    const rolePermissionSeedService = app.get(RolePermissionSeedService);
    await rolePermissionSeedService.seed();

    // 2. Seed default admin user
    logger.log("Seeding default admin user...");
    const defaultUsersSeedService = app.get(DefaultUsersSeedService);
    await defaultUsersSeedService.seed();

    // 3. Seed sample accommodations
    logger.log("Seeding sample accommodations...");
    const defaultAccommodationsSeedService = app.get(
      DefaultAccommodationsSeedService,
    );
    await defaultAccommodationsSeedService.seed();

    // 4. Seed sample customer
    logger.log("Seeding sample customer...");
    const defaultCustomersSeedService = app.get(DefaultCustomersSeedService);
    await defaultCustomersSeedService.seed();

    logger.log("Database seeding completed successfully!");
  } catch (error) {
    logger.error("Seeding failed:", error);
    throw error;
  } finally {
    await app.close();
  }
}

bootstrap().catch((error) => {
  console.error("Seeding failed:", error);
  process.exit(1);
});
