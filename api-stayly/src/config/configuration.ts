/**
 * Configuration schema for environment variables
 * Validates and provides typed access to configuration
 */

export default () => ({
  // Application
  app: {
    name: process.env.APP_NAME || "Stayly API",
    port: parseInt(process.env.PORT || "3000", 10),
    env: process.env.NODE_ENV || "development",
  },

  // Database
  database: {
    host: process.env.DATABASE_HOST || "localhost",
    port: parseInt(process.env.DATABASE_PORT || "5433", 10),
    name: process.env.DATABASE_NAME || "stayly_db",
    user: process.env.DATABASE_USER || "stayly_user",
    password: process.env.DATABASE_PASSWORD || "stayly_password",
    synchronize: process.env.DATABASE_SYNCHRONIZE === "true",
    logging: process.env.DATABASE_LOGGING === "true",
  },

  // Redis
  redis: {
    host: process.env.REDIS_HOST || "localhost",
    port: parseInt(process.env.REDIS_PORT || "6379", 10),
    password: process.env.REDIS_PASSWORD || undefined,
    ttl: parseInt(process.env.REDIS_TTL || "3600", 10),
  },

  // Kafka
  kafka: {
    brokers: process.env.KAFKA_BROKERS?.split(",") || ["localhost:9092"],
    clientId: process.env.KAFKA_CLIENT_ID || "stayly-api",
    groupId: process.env.KAFKA_GROUP_ID || "stayly-consumer-group",
  },

  // JWT
  jwt: {
    secret: process.env.JWT_SECRET || "your-secret-key-change-in-production",
    expiresIn: process.env.JWT_EXPIRES_IN || "15m",
    refreshSecret:
      process.env.JWT_REFRESH_SECRET ||
      "your-refresh-secret-key-change-in-production",
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
  },

  // Security
  security: {
    bcryptSaltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS || "12", 10),
  },

  // CORS
  cors: {
    origin: process.env.CORS_ORIGIN || "http://localhost:3001",
  },

  // Logging
  logging: {
    level: process.env.LOG_LEVEL || "debug",
    format: process.env.LOG_FORMAT || "json",
  },

  // Notification
  notification: {
    email: {
      sender: process.env.NOTIFICATION_EMAIL_SENDER || "no-reply@stayly.io",
      provider: process.env.NOTIFICATION_EMAIL_PROVIDER || "logger",
    },
    kafkaTopics: {
      passwordReset:
        process.env.KAFKA_TOPIC_NOTIFICATION_PASSWORD_RESET ||
        "notification.password-reset",
    },
  },

  // Seeds
  seeds: {
    superAdminEmail: process.env.SEED_SUPER_ADMIN_EMAIL || "admin@stayly.dev",
    superAdminPassword: process.env.SEED_SUPER_ADMIN_PASSWORD || "ChangeMe123!",
    superAdminName: process.env.SEED_SUPER_ADMIN_NAME || "System Super Admin",
    sampleCustomerEmail:
      process.env.SEED_SAMPLE_CUSTOMER_EMAIL || "customer@stayly.dev",
    sampleCustomerPassword:
      process.env.SEED_SAMPLE_CUSTOMER_PASSWORD || "Customer123!",
    sampleCustomerName:
      process.env.SEED_SAMPLE_CUSTOMER_NAME || "Sample Customer",
    sampleCustomerPhone:
      process.env.SEED_SAMPLE_CUSTOMER_PHONE || "+84000000000",
  },
});
