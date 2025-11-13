# Kiến trúc hệ thống - Hệ thống quản lý Homestay & Hotel Booking

## 1. Tổng quan kiến trúc

### 1.1. Nguyên tắc thiết kế

- **Domain-Driven Design (DDD):** Hệ thống được thiết kế dựa trên Domain Model với 13 Aggregate Roots
- **Separation of Concerns:** Tách biệt rõ ràng giữa Domain, Application, Infrastructure
- **Scalability:** Hỗ trợ mở rộng theo chiều ngang (horizontal scaling)
- **High Availability:** Đảm bảo uptime 99.9%+
- **Security First:** Bảo mật từ tầng infrastructure đến application layer
- **Performance:** Tối ưu response time, đặc biệt cho search và booking

### 1.2. Kiến trúc tổng thể

```
┌─────────────────────────────────────────────────────────────────┐
│                        Client Layer                              │
├──────────────────────┬──────────────────────────────────────────┤
│  Web Frontend        │  Mobile App (iOS/Android)                │
│  (React/Next.js)     │  (React Native/Flutter)                 │
└──────────┬───────────┴──────────────┬──────────────────────────┘
           │                           │
           │  HTTPS/REST API           │
           │                           │
┌──────────▼──────────────────────────▼──────────────────────────┐
│                    API Gateway Layer                             │
│  - Authentication & Authorization                               │
│  - Rate Limiting                                                 │
│  - Request Routing                                               │
│  - Load Balancing                                                │
└──────────┬──────────────────────────────────────────────────────┘
           │
           │
┌──────────▼──────────────────────────────────────────────────────┐
│              Application Services Layer (Backend)               │
├──────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Booking    │  │  Payment     │  │  Search      │          │
│  │   Service    │  │  Service     │  │  Service     │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │  User        │  │  Notification │  │  Reporting   │          │
│  │  Service     │  │  Service     │  │  Service     │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└──────────┬──────────────────────────────────────────────────────┘
           │
           │ Domain Events / Message Queue
           │
┌──────────▼──────────────────────────────────────────────────────┐
│                    Domain Layer (DDD)                            │
│  - 13 Aggregate Roots                                           │
│  - Domain Services                                              │
│  - Domain Events                                                │
│  - Value Objects                                                │
└──────────┬──────────────────────────────────────────────────────┘
           │
           │ Repository Pattern
           │
┌──────────▼──────────────────────────────────────────────────────┐
│              Infrastructure Layer                                │
│  - Database (PostgreSQL + Redis)                                │
│  - Message Queue (Apache Kafka)                                   │
│  - File Storage (S3/MinIO)                                      │
│  - External Services (Payment, Email, SMS, Maps)                 │
└──────────────────────────────────────────────────────────────────┘
```

## 2. Technology Stack

**Tóm tắt nhanh (Free, Open Source, Dễ tiếp cận cho team nhỏ):**

| Category | Technology | Lý do chọn |
|----------|-----------|------------|
| **Backend Framework** | NestJS (Node.js/TypeScript) | Type-safe, DDD support, modular, dễ scale |
| **Frontend Framework** | Next.js 14+ (React 18+) | SSR, SEO, performance, TypeScript |
| **Database** | PostgreSQL 15+ | ACID, JSON support, full-text search built-in |
| **Cache** | Redis 7+ | Session, cache, rate limiting |
| **Message Queue** | Apache Kafka | Free, open source, high throughput, event streaming |
| **Search** | PostgreSQL Full-Text Search | Built-in, không cần service riêng |
| **File Storage** | Local Storage / MinIO | Free, S3-compatible |
| **ORM** | TypeORM | Native NestJS integration |
| **Monitoring** | Prometheus + Grafana | Free, open source |
| **Logging** | Winston/Pino | Built-in với NestJS |
| **Error Tracking** | Sentry | Free tier available |
| **Container** | Docker + Docker Compose | Development environment |
| **CI/CD** | GitHub Actions | Free cho public repos |

### 2.1. Backend

**Core Framework:**
- **NestJS (Node.js/TypeScript)**
  - TypeScript cho type safety và developer experience tốt
  - Built-in support cho DDD, CQRS, Dependency Injection
  - Modular architecture - dễ chia thành bounded contexts
  - Microservices architecture ready - dễ mở rộng sau này
  - Performance tốt với Node.js
  - Decorator pattern, Guards, Interceptors, Pipes
  - Excellent documentation và community

**Database:**
- **PostgreSQL 15+**
  - ACID compliance cho financial transactions
  - JSON/JSONB support cho flexible data
  - Full-text search capabilities (built-in, không cần Elasticsearch giai đoạn đầu)
  - Performance và scalability tốt
  - Support cho complex queries
  - PostGIS extension cho geospatial queries (maps)

**Cache & Session:**
- **Redis 7+**
  - Session storage
  - Cache layer (search results, pricing, availability)
  - Rate limiting
  - Real-time features (pub/sub)

**Message Queue:**
- **Apache Kafka**
  - **Lý do chọn:** Free, open source, high throughput, event streaming
  - Perfect cho event-driven architecture
  - Durable message storage
  - Horizontal scaling
  - Xử lý async: emails, notifications, reports
  - Domain events distribution
  - Event sourcing support
  - Consumer groups cho load balancing
  - **Setup:** Dễ dàng với Docker Compose (Kafka + Zookeeper hoặc KRaft mode - không cần Zookeeper)
  - **Monitoring:** Kafka UI / Kafka Manager (free, open source)
  - **NestJS Integration:** 
    - Sử dụng `@nestjs/microservices` với Kafka transporter
    - Hoặc `kafkajs` library trực tiếp
    - Event-driven pattern với decorators

**Search Engine:**
- **PostgreSQL Full-Text Search** (giai đoạn đầu)
  - Built-in, không cần service riêng
  - Đủ cho nhu cầu search cơ bản
  - Có thể migrate sang Elasticsearch sau khi scale

**File Storage:**
- **Local Storage** (giai đoạn đầu)
  - Hoặc **MinIO** (S3-compatible, free, open source)
  - Dễ setup, không cần cloud service
  - Có thể migrate sang S3 sau

### 2.2. Frontend

**Web Application:**
- **Next.js 16+ (React 19.2)**
  - Server-side rendering (SSR) cho SEO
  - Static site generation (SSG) cho performance
  - API routes cho BFF pattern
  - Developer experience tốt
  - TypeScript support

**Admin Panel:**
- **Next.js Admin Dashboard**
  - Hoặc **React Admin** / **Refine**
  - Reusable components
  - Built-in CRUD operations

**Mobile:**
- **React Native** (nếu cần native)
  - Hoặc **PWA** (Progressive Web App) - cost-effective
  - Shared codebase với web

### 2.3. Infrastructure & DevOps

**Containerization:**
- **Docker** + **Docker Compose** (development)
- **Kubernetes** (production - nếu scale lớn)

**CI/CD:**
- **GitHub Actions** / **GitLab CI**
- Automated testing
- Automated deployment

**Cloud Provider:**
- **AWS** / **Google Cloud** / **Azure**
  - RDS cho PostgreSQL
  - ElastiCache cho Redis
  - S3 cho file storage
  - CloudFront cho CDN
  - Load Balancer

**Monitoring & Logging:**
- **Prometheus** + **Grafana** (metrics - free, open source)
  - Metrics collection và visualization
  - Alerting rules
- **Winston** hoặc **Pino** (logging - built-in với NestJS)
  - Structured logging
  - File-based hoặc console output (giai đoạn đầu)
  - Có thể tích hợp ELK Stack sau
- **Sentry** (error tracking - có free tier)
  - Error tracking và monitoring
  - Performance monitoring

## 3. Kiến trúc chi tiết

### 3.1. Clean Architecture Principles

Hệ thống tuân thủ **Clean Architecture** (Robert C. Martin) kết hợp với **Domain-Driven Design (DDD)** để đảm bảo:

- **Independence:** Business logic độc lập hoàn toàn với frameworks, UI, database, external services
- **Testability:** Dễ dàng test business logic mà không cần database, web server, hoặc external services
- **Maintainability:** Thay đổi framework hoặc external services không ảnh hưởng đến business logic
- **Flexibility:** Dễ dàng thay đổi implementation details mà không ảnh hưởng core logic

**Dependency Rule (Quy tắc phụ thuộc):**
- Dependencies chỉ hướng vào trong (inward)
- Outer layers phụ thuộc vào inner layers
- Inner layers KHÔNG BAO GIỜ phụ thuộc vào outer layers
- Inner layers không biết gì về outer layers

**Clean Architecture Layers:**

```
┌─────────────────────────────────────────────────────────────────┐
│                    Frameworks & Drivers                        │
│  (Outermost Layer - Dependencies)                              │
│  - Web Framework (NestJS)                                      │
│  - Database (PostgreSQL/TypeORM)                               │
│  - Message Queue (Kafka)                                        │
│  - External Services (Payment, Email, SMS)                     │
└───────────────────────┬─────────────────────────────────────────┘
                        │ depends on
┌───────────────────────▼─────────────────────────────────────────┐
│              Interface Adapters                                 │
│  - Controllers (REST API)                                       │
│  - Repository Implementations                                   │
│  - External Service Adapters                                    │
│  - DTOs & Mappers                                              │
└───────────────────────┬─────────────────────────────────────────┘
                        │ depends on
┌───────────────────────▼─────────────────────────────────────────┐
│              Application Business Rules                         │
│  (Use Cases / Application Services)                             │
│  - Command Handlers                                            │
│  - Query Handlers                                              │
│  - Application Services                                        │
│  - DTOs (Application Layer)                                    │
└───────────────────────┬─────────────────────────────────────────┘
                        │ depends on
┌───────────────────────▼─────────────────────────────────────────┐
│              Enterprise Business Rules                         │
│  (Domain Layer - Innermost)                                     │
│  - Aggregate Roots                                             │
│  - Entities                                                    │
│  - Value Objects                                               │
│  - Domain Services                                             │
│  - Domain Events                                               │
│  - Repository Interfaces (chỉ interface)                     │
└─────────────────────────────────────────────────────────────────┘
```

**Mapping Clean Architecture với NestJS Layers:**

| Clean Architecture Layer | NestJS Layer | Location | Dependencies |
|--------------------------|--------------|----------|--------------|
| **Enterprise Business Rules** | Domain Layer | `domain/` | None (pure TypeScript) |
| **Application Business Rules** | Application Layer | `application/` | Domain Layer only |
| **Interface Adapters** | Infrastructure + Presentation | `infrastructure/`, `presentation/` | Application + Domain |
| **Frameworks & Drivers** | NestJS Framework, TypeORM, Kafka | External libraries | All layers |

**Ví dụ Dependency Flow:**

```typescript
// ✅ CORRECT: Outer → Inner (Presentation → Application → Domain)
@Controller('bookings')
export class BookingController {  // Presentation Layer
  constructor(
    private readonly createBookingHandler: CreateBookingHandler  // Application Layer
  ) {}
}

@CommandHandler(CreateBookingCommand)
export class CreateBookingHandler {  // Application Layer
  constructor(
    private readonly bookingRepo: IBookingRepository,  // Domain Interface
    private readonly bookingFactory: BookingFactory  // Domain Service
  ) {}
}

// ❌ WRONG: Inner → Outer (Domain → Infrastructure)
export class Booking {  // Domain Layer
  // ❌ KHÔNG được inject TypeORM Repository trực tiếp
  // ❌ KHÔNG được import từ infrastructure/
  // ✅ CHỈ sử dụng Repository Interface từ domain/repositories/
}
```

### 3.2. Layered Architecture (Onion Architecture)

**Onion Architecture** là implementation cụ thể của Clean Architecture, với các layers:

```
┌─────────────────────────────────────────┐
│         Presentation Layer              │
│  (Outermost - Frameworks & Drivers)     │
│  - Controllers (REST API)               │
│  - Request/Response DTOs                │
│  - Validation Middleware               │
└─────────────────┬───────────────────────┘
                  │ depends on
┌─────────────────▼───────────────────────┐
│      Application Layer                   │
│  (Use Cases / Application Services)      │
│  - Application Services                  │
│  - Use Cases / Commands & Queries        │
│  - DTOs Mapping                          │
│  - Transaction Management                │
└─────────────────┬───────────────────────┘
                  │ depends on
┌─────────────────▼───────────────────────┐
│         Domain Layer                     │
│  (Innermost - Enterprise Business Rules) │
│  - Aggregate Roots (13)                 │
│  - Entities                              │
│  - Value Objects                        │
│  - Domain Services                      │
│  - Domain Events                        │
│  - Business Rules                        │
│  - Repository Interfaces (chỉ interface)│
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│      Infrastructure Layer               │
│  (Interface Adapters)                   │
│  - Repositories Implementation          │
│  - External Services Integration        │
│  - Database Access (TypeORM)            │
│  - Message Queue (Kafka)                │
│  - File Storage                         │
└─────────────────────────────────────────┘
```

**Lưu ý quan trọng:**
- **Domain Layer** là innermost, không phụ thuộc vào bất kỳ layer nào
- **Infrastructure Layer** implement các interfaces từ Domain Layer
- **Presentation Layer** gọi Application Layer, không gọi trực tiếp Domain Layer
- **Application Layer** orchestrate Domain Layer và Infrastructure Layer

### 3.3. Dependency Injection & Inversion of Control

**Nguyên tắc Dependency Inversion (SOLID):**
- High-level modules không phụ thuộc vào low-level modules
- Cả hai đều phụ thuộc vào abstractions (interfaces)
- Abstractions không phụ thuộc vào details
- Details phụ thuộc vào abstractions

**Implementation trong NestJS:**

```typescript
// ✅ CORRECT: Domain Layer định nghĩa interface
// domain/repositories/booking.repository.interface.ts
export interface IBookingRepository {
  save(booking: Booking): Promise<void>;
  findById(id: BookingId): Promise<Booking | null>;
}

// ✅ CORRECT: Infrastructure Layer implement interface
// infrastructure/persistence/repositories/booking.repository.ts
@Injectable()
export class BookingRepository implements IBookingRepository {
  constructor(
    @InjectRepository(BookingOrmEntity)
    private readonly bookingRepo: Repository<BookingOrmEntity>,
  ) {}

  async save(booking: Booking): Promise<void> {
    // Implementation details
  }
}

// ✅ CORRECT: Application Layer sử dụng interface (không biết implementation)
// application/commands/handlers/create-booking.handler.ts
@CommandHandler(CreateBookingCommand)
export class CreateBookingHandler {
  constructor(
    @Inject('IBookingRepository')  // Inject interface, không phải class
    private readonly bookingRepo: IBookingRepository,
  ) {}
}

// ✅ CORRECT: Module binding interface với implementation
// booking.module.ts
@Module({
  providers: [
    {
      provide: 'IBookingRepository',  // Interface token
      useClass: BookingRepository,      // Implementation class
    },
  ],
})
export class BookingModule {}
```

**Lợi ích:**
- Domain Layer không phụ thuộc vào Infrastructure
- Dễ dàng thay đổi implementation (ví dụ: từ TypeORM sang Prisma)
- Dễ test: có thể mock repository interface
- Tuân thủ Dependency Inversion Principle

### 3.4. CQRS Pattern (Command Query Responsibility Segregation)

**Lý do sử dụng:**
- Tách biệt Read và Write operations
- Tối ưu performance cho read-heavy operations (search, reports)
- Independent scaling cho read/write
- Phù hợp với DDD

**Implementation:**
- **Command Side (Write):**
  - Commands: CreateBooking, ConfirmPayment, CancelBooking
  - Command Handlers trong Application Layer
  - Write to primary database (PostgreSQL)
  
- **Query Side (Read):**
  - Queries: SearchAccommodations, GetBookingDetails, GetReports
  - Query Handlers
  - Read from read replicas hoặc denormalized views
  - Cache layer cho frequent queries

**Read Models:**
- Denormalized views cho search
- Materialized views cho reports
- PostgreSQL Full-Text Search cho search (giai đoạn đầu)
- Có thể migrate sang Elasticsearch sau khi scale

### 3.5. Event-Driven Architecture

**Domain Events:**
- `BookingCreated`
- `BookingConfirmed`
- `PaymentSucceeded`
- `BookingCancelled`
- `ServiceBooked`
- `ReviewCreated`

**Event Handlers:**
- Update read models
- Send notifications
- Update analytics
- Trigger workflows

**Event Store (Optional):**
- Lưu trữ events cho audit trail
- Event sourcing cho critical aggregates (Booking, Payment)

**Kafka Integration với NestJS:**

```typescript
// 1. Setup Kafka Module
@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'KAFKA_SERVICE',
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: 'booking-service',
            brokers: ['localhost:9092'],
          },
          consumer: {
            groupId: 'booking-consumer-group',
          },
        },
      },
    ]),
  ],
})
export class KafkaModule {}

// 2. Producer - Publish Domain Events
@Injectable()
export class BookingEventPublisher {
  constructor(
    @Inject('KAFKA_SERVICE') private readonly kafkaClient: ClientKafka,
  ) {}

  async publish(event: DomainEvent): Promise<void> {
    await this.kafkaClient.emit(event.topic, {
      key: event.aggregateId,
      value: JSON.stringify(event),
    });
  }
}

// 3. Consumer - Handle Domain Events
@Controller()
export class NotificationController {
  @MessagePattern('booking.created')
  async handleBookingCreated(@Payload() data: any) {
    const event = JSON.parse(data.value);
    // Handle event
    await this.notificationService.sendBookingConfirmation(event.bookingId);
  }
}

// 4. Domain Event Example
export class BookingCreatedEvent implements DomainEvent {
  constructor(
    public readonly bookingId: string,
    public readonly customerId: string,
    public readonly totalAmount: number,
    public readonly occurredAt: Date = new Date(),
  ) {}

  get topic(): string {
    return 'booking.created';
  }

  get aggregateId(): string {
    return this.bookingId;
  }
}
```

**Kafka Topics cho Domain Events:**
- `booking.created`
- `booking.confirmed`
- `booking.cancelled`
- `payment.succeeded`
- `payment.failed`
- `service.booking.created`
- `review.created`

### 3.6. Modular Monolith với Bounded Contexts

**Khuyến nghị: Modular Monolith (ban đầu)**

**Lý do:**
- Team size nhỏ/trung bình
- Dễ phát triển và maintain
- Shared database (dễ quản lý transactions)
- Có thể tách thành microservices sau
- Mỗi bounded context là một module độc lập

**Cấu trúc thư mục theo Bounded Contexts (NestJS):**

```
src/
├── common/                          # Shared code - Dùng chung cho tất cả bounded contexts
│   ├── decorators/                  # Custom decorators (ví dụ: @Roles, @Permissions)
│   ├── guards/                      # Auth guards (JwtAuthGuard, RolesGuard)
│   ├── interceptors/                # Interceptors (LoggingInterceptor, CacheInterceptor)
│   ├── pipes/                       # Validation pipes (ParseIntPipe, ValidationPipe)
│   ├── filters/                     # Exception filters (HttpExceptionFilter)
│   ├── utils/                       # Utility functions (helpers, formatters)
│   └── infrastructure/              # Shared Infrastructure Services
│       ├── kafka/                   # Kafka Integration (Shared)
│       │   ├── kafka.module.ts     # Kafka module setup và configuration
│       │   ├── kafka.producer.service.ts  # Base producer service
│       │   ├── kafka.consumer.service.ts  # Base consumer service
│       │   ├── kafka.config.ts     # Kafka connection config
│       │   └── interfaces/
│       │       └── event-publisher.interface.ts
│       ├── database/                # Database utilities
│       │   ├── database.module.ts
│       │   └── database.service.ts
│       ├── cache/                   # Cache utilities (Redis)
│       │   ├── cache.module.ts
│       │   └── cache.service.ts
│       └── logger/                  # Logging utilities
│           └── logger.service.ts
│
├── bounded-contexts/                # Các Bounded Contexts - Mỗi context là một module độc lập
│   │
│   ├── user-management/            # Bounded Context: User Management
│   │   ├── user.module.ts
│   │   ├── domain/
│   │   │   ├── entities/
│   │   │   │   ├── user.entity.ts
│   │   │   │   └── user-permission.entity.ts
│   │   │   ├── value-objects/
│   │   │   │   ├── email.vo.ts
│   │   │   │   └── role.vo.ts
│   │   │   ├── repositories/
│   │   │   │   └── user.repository.interface.ts
│   │   │   ├── services/
│   │   │   │   └── user-creation.service.ts
│   │   │   └── events/
│   │   │       └── user-created.event.ts
│   │   ├── application/
│   │   │   ├── commands/
│   │   │   │   ├── create-user.command.ts
│   │   │   │   └── handlers/
│   │   │   │       └── create-user.handler.ts
│   │   │   ├── queries/
│   │   │   │   ├── get-user.query.ts
│   │   │   │   └── handlers/
│   │   │   │       └── get-user.handler.ts
│   │   │   └── dto/
│   │   │       └── create-user.dto.ts
│   │   ├── infrastructure/
│   │   │   ├── persistence/        # Database access layer
│   │   │   │   ├── repositories/
│   │   │   │   │   └── user.repository.ts  # Repository implementation
│   │   │   │   └── entities/
│   │   │   │       └── user.orm-entity.ts  # TypeORM entities
│   │   │   ├── kafka/              # Kafka integration cho context này
│   │   │   │   ├── user-event.publisher.ts  # Publish events từ User context
│   │   │   │   └── user-event.consumer.ts   # Consume events liên quan đến User
│   │   │   └── external/            # External services integration
│   │   │       └── email.service.ts  # Email service (SendGrid, etc.)
│   │   └── presentation/
│   │       ├── controllers/
│   │       │   └── user.controller.ts
│   │       └── guards/
│   │           └── roles.guard.ts
│   │
│   ├── customer-management/         # Bounded Context: Customer Management
│   │   ├── customer.module.ts
│   │   ├── domain/
│   │   ├── application/
│   │   ├── infrastructure/
│   │   └── presentation/
│   │
│   ├── accommodation-management/   # Bounded Context: Accommodation Management
│   │   ├── accommodation.module.ts
│   │   ├── domain/
│   │   │   ├── entities/
│   │   │   │   ├── accommodation.entity.ts
│   │   │   │   ├── homestay.entity.ts
│   │   │   │   ├── hotel.entity.ts
│   │   │   │   └── floor.entity.ts
│   │   │   └── ...
│   │   ├── application/
│   │   ├── infrastructure/
│   │   └── presentation/
│   │
│   ├── room-management/            # Bounded Context: Room Management
│   │   ├── room.module.ts
│   │   ├── domain/
│   │   ├── application/
│   │   ├── infrastructure/
│   │   └── presentation/
│   │
│   ├── booking-management/         # Bounded Context: Booking Management
│   │   ├── booking.module.ts
│   │   ├── domain/
│   │   ├── application/
│   │   ├── infrastructure/
│   │   └── presentation/
│   │
│   ├── payment-management/         # Bounded Context: Payment Management
│   │   ├── payment.module.ts
│   │   ├── domain/
│   │   ├── application/
│   │   ├── infrastructure/
│   │   └── presentation/
│   │
│   ├── service-management/        # Bounded Context: Service Management (Hotel)
│   │   ├── service.module.ts
│   │   ├── domain/
│   │   ├── application/
│   │   ├── infrastructure/
│   │   └── presentation/
│   │
│   ├── review-management/         # Bounded Context: Review Management
│   │   ├── review.module.ts
│   │   ├── domain/
│   │   ├── application/
│   │   ├── infrastructure/
│   │   └── presentation/
│   │
│   ├── promotion-management/     # Bounded Context: Promotion Management
│   │   ├── promotion.module.ts
│   │   ├── domain/
│   │   ├── application/
│   │   ├── infrastructure/
│   │   └── presentation/
│   │
│   ├── pricing-management/        # Bounded Context: Pricing Management
│   │   ├── pricing.module.ts
│   │   ├── domain/
│   │   ├── application/
│   │   ├── infrastructure/
│   │   └── presentation/
│   │
│   ├── notification-management/   # Bounded Context: Notification Management
│   │   ├── notification.module.ts
│   │   ├── domain/
│   │   ├── application/
│   │   ├── infrastructure/
│   │   └── presentation/
│   │
│   └── reporting-management/      # Bounded Context: Reporting Management
│       ├── reporting.module.ts
│       ├── domain/
│       ├── application/
│       ├── infrastructure/
│       └── presentation/
│
├── app.module.ts                   # Root module - import tất cả bounded contexts
└── main.ts                         # Application entry point
```

**Giải thích chi tiết các thư mục:**

### 1. `common/` - Shared Code

**Mục đích:** Chứa code dùng chung cho tất cả bounded contexts, tránh duplicate code.

**Các thư mục con:**

- **`decorators/`**: Custom decorators
  - Ví dụ: `@Roles('admin')`, `@Permissions('manage_booking')`, `@Public()` (skip auth)
  
- **`guards/`**: Authentication & Authorization guards
  - `JwtAuthGuard`: Xác thực JWT token
  - `RolesGuard`: Kiểm tra role của user
  - `PermissionsGuard`: Kiểm tra permissions

- **`interceptors/`**: Cross-cutting concerns
  - `LoggingInterceptor`: Log tất cả requests
  - `CacheInterceptor`: Cache responses
  - `TransformInterceptor`: Transform response format
  - `TimeoutInterceptor`: Request timeout handling

- **`pipes/`**: Data transformation & validation
  - `ValidationPipe`: Validate DTOs
  - `ParseIntPipe`: Parse string to number
  - `ParseUUIDPipe`: Parse string to UUID

- **`filters/`**: Exception handling
  - `HttpExceptionFilter`: Handle HTTP exceptions
  - `AllExceptionsFilter`: Catch-all exception handler

- **`utils/`**: Utility functions
  - Helpers, formatters, validators
  - Date utilities, string utilities, etc.

- **`infrastructure/`**: Shared infrastructure services
  - **`kafka/`**: Kafka Integration (Shared)
    - `kafka.module.ts`: Setup Kafka connection và configuration
    - `kafka.producer.service.ts`: Base producer service để publish events
    - `kafka.consumer.service.ts`: Base consumer service để consume events
    - `kafka.config.ts`: Kafka connection config (brokers, clientId, etc.)
    - `interfaces/event-publisher.interface.ts`: Interface cho event publisher
  - **`database/`**: Database utilities
    - Connection pooling
    - Transaction helpers
  - **`cache/`**: Cache utilities (Redis)
    - Cache service wrapper
    - Cache key generators
  - **`logger/`**: Logging service
    - Structured logging
    - Log levels, formats

### 2. `bounded-contexts/` - Domain Modules

**Mục đích:** Mỗi bounded context là một module độc lập, đại diện cho một domain trong hệ thống.

**Cấu trúc mỗi bounded context:**

```
bounded-contexts/
└── {context-name}/
    ├── {context}.module.ts         # NestJS module - export/import dependencies
    │
    ├── domain/                      # Domain Layer - Core business logic
    │   ├── entities/                # Aggregate Roots & Entities
    │   │   └── {entity}.entity.ts  # Domain entities (không phải ORM entities)
    │   ├── value-objects/           # Value Objects
    │   │   └── {vo}.vo.ts          # Immutable value objects
    │   ├── repositories/            # Repository Interfaces
    │   │   └── {entity}.repository.interface.ts  # Chỉ interface, không implementation
    │   ├── services/                # Domain Services
    │   │   └── {service}.service.ts  # Business logic không thuộc về entity
    │   └── events/                 # Domain Events
    │       └── {event}.event.ts    # Domain events definitions
    │
    ├── application/                # Application Layer - Use Cases
    │   ├── commands/               # Write operations (CQRS)
    │   │   ├── {command}.command.ts
    │   │   └── handlers/
    │   │       └── {command}.handler.ts
    │   ├── queries/                # Read operations (CQRS)
    │   │   ├── {query}.query.ts
    │   │   └── handlers/
    │   │       └── {query}.handler.ts
    │   └── dto/                     # Data Transfer Objects
    │       ├── {create}.dto.ts      # Request DTOs
    │       └── {response}.dto.ts    # Response DTOs
    │
    ├── infrastructure/             # Infrastructure Layer - Technical details
    │   ├── persistence/            # Database access
    │   │   ├── repositories/
    │   │   │   └── {entity}.repository.ts  # Repository implementation
    │   │   └── entities/
    │   │       └── {entity}.orm-entity.ts  # TypeORM entities
    │   ├── kafka/                  # Kafka integration cho context này
    │   │   ├── {context}-event.publisher.ts  # Publish events từ context này
    │   │   └── {context}-event.consumer.ts   # Consume events từ contexts khác
    │   └── external/               # External services
    │       └── {service}.service.ts  # Payment gateway, Email, SMS, etc.
    │
    └── presentation/               # Presentation Layer - API
        ├── controllers/
        │   └── {entity}.controller.ts  # REST API endpoints
        ├── guards/                 # Context-specific guards (nếu có)
        └── decorators/             # Context-specific decorators (nếu có)
```

**Giải thích từng layer:**

#### Domain Layer (`domain/`) - Enterprise Business Rules

**Nguyên tắc Clean Architecture:**
- **Innermost layer** - không phụ thuộc vào bất kỳ layer nào
- **Pure TypeScript** - không import NestJS decorators, TypeORM, hoặc external libraries
- **Business logic thuần túy** - không có technical concerns

**Components:**

- **Entities**: Domain entities (Aggregate Roots)
  - Chứa business logic và business rules
  - Không phụ thuộc vào framework (không có `@Entity`, `@Column`, etc.)
  - Immutable khi có thể
  - Example: `Booking`, `User`, `Accommodation`
  
- **Value Objects**: Immutable objects
  - Email, Money, DateRange, Address
  - Validation logic trong value object
  - Self-contained, không có identity
  - Example: `Email`, `Money`, `DateRange`
  
- **Repositories (Interfaces)**: Chỉ định nghĩa interface
  - **KHÔNG có implementation** ở đây
  - Định nghĩa contract cho data access
  - Domain Layer chỉ biết interface, không biết implementation
  - Example: `IBookingRepository`, `IUserRepository`
  
- **Domain Services**: Business logic không thuộc về entity
  - Logic phức tạp cần nhiều entities
  - Pure functions hoặc classes không phụ thuộc infrastructure
  - Example: `BookingAvailabilityService`, `PriceCalculationService`
  
- **Domain Events**: Events phát sinh từ domain
  - BookingCreatedEvent
  - PaymentSucceededEvent
  - Định nghĩa events, không có event publishing logic

**Ví dụ Domain Entity (Clean Architecture):**

```typescript
// ✅ CORRECT: Pure domain entity, không phụ thuộc framework
// domain/entities/booking.entity.ts
export class Booking {
  private constructor(
    private readonly id: BookingId,
    private readonly customerId: CustomerId,
    private status: BookingStatus,
    private readonly dateRange: DateRange,
    // ... other properties
  ) {}

  static create(props: CreateBookingProps): Booking {
    // Business rules validation
    if (props.dateRange.checkOutDate <= props.dateRange.checkInDate) {
      throw new InvalidDateRangeError();
    }
    
    return new Booking(
      BookingId.generate(),
      props.customerId,
      BookingStatus.PENDING_PAYMENT,
      props.dateRange,
    );
  }

  confirm(): void {
    // Business rule: chỉ có thể confirm booking pending_payment
    if (this.status !== BookingStatus.PENDING_PAYMENT) {
      throw new InvalidBookingStatusError();
    }
    
    this.status = BookingStatus.CONFIRMED;
    this.raiseEvent(new BookingConfirmedEvent(this.id));
  }

  // Business logic methods
  // Không có database access, không có HTTP calls
}
```

#### Application Layer (`application/`) - Application Business Rules

**Nguyên tắc Clean Architecture:**
- **Use Cases** - orchestrate Domain Layer
- **Phụ thuộc Domain Layer** - không phụ thuộc Infrastructure hoặc Presentation
- **Có thể sử dụng NestJS decorators** - nhưng không phụ thuộc vào framework details

**Components:**

- **Commands**: Write operations (CQRS)
  - CreateBookingCommand
  - CancelBookingCommand
  - Command Handlers orchestrate Domain Layer
  - Coordinate multiple aggregates nếu cần
  - Transaction management
  
- **Queries**: Read operations (CQRS)
  - GetBookingQuery
  - SearchAccommodationsQuery
  - Query Handlers trả về data
  - Có thể đọc từ read models (denormalized)
  
- **DTOs**: Data Transfer Objects
  - Request DTOs (validation với class-validator)
  - Response DTOs (serialization)
  - Mapping giữa Domain entities và DTOs

**Ví dụ Command Handler (Clean Architecture):**

```typescript
// ✅ CORRECT: Application Layer orchestrate Domain Layer
// application/commands/handlers/create-booking.handler.ts
@CommandHandler(CreateBookingCommand)
export class CreateBookingHandler {
  constructor(
    @Inject('IBookingRepository')  // Interface từ Domain
    private readonly bookingRepo: IBookingRepository,
    @Inject('IRoomRepository')     // Interface từ Domain
    private readonly roomRepo: IRoomRepository,
    private readonly bookingFactory: BookingFactory,  // Domain Service
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: CreateBookingCommand): Promise<BookingDto> {
    // 1. Validate business rules (sử dụng Domain Services)
    const room = await this.roomRepo.findById(command.roomId);
    if (!room) {
      throw new RoomNotFoundError();
    }

    const isAvailable = await this.bookingFactory.checkAvailability(
      command.roomId,
      command.dateRange,
    );
    if (!isAvailable) {
      throw new RoomNotAvailableError();
    }

    // 2. Create domain entity (sử dụng Domain Factory)
    const booking = await this.bookingFactory.create({
      customerId: command.customerId,
      roomId: command.roomId,
      dateRange: command.dateRange,
      guestInfo: command.guestInfo,
    });

    // 3. Persist (sử dụng Repository Interface)
    await this.bookingRepo.save(booking);

    // 4. Publish domain events
    booking.getDomainEvents().forEach((event) => {
      this.eventBus.publish(event);
    });
    booking.clearEvents();

    // 5. Return DTO (mapping từ Domain entity)
    return BookingMapper.toDto(booking);
  }
}
```

#### Infrastructure Layer (`infrastructure/`) - Interface Adapters

**Nguyên tắc Clean Architecture:**
- **Implement interfaces** từ Domain và Application layers
- **Adapt external systems** (database, message queue, external APIs) cho Domain/Application
- **Có thể phụ thuộc frameworks** (TypeORM, Kafka, NestJS)

**Components:**

- **Persistence**: Database implementation
  - Repository implementations (implement Domain interfaces)
  - TypeORM entities (mapping với domain entities)
  - Mappers: Domain Entity ↔ ORM Entity
  - Migrations
  - Example: `BookingRepository implements IBookingRepository`
  
- **Kafka**: Event publishing/consuming
  - **Publisher**: Publish domain events lên Kafka topics
    - Sử dụng base producer service từ `common/infrastructure/kafka/`
    - Implement interface `IEventPublisher` (từ Domain hoặc Application)
  - **Consumer**: Consume events từ Kafka topics khác
    - Subscribe vào topics của contexts khác
    - Xử lý events và trigger business logic (gọi Application Layer)
  
- **External**: Third-party services
  - Payment gateways (implement PaymentGateway interface)
  - Email services (implement EmailService interface)
  - SMS services (implement SMSService interface)
  - Adapter pattern để abstract external APIs

**Ví dụ Repository Implementation (Clean Architecture):**

```typescript
// ✅ CORRECT: Infrastructure implement Domain interface
// infrastructure/persistence/repositories/booking.repository.ts
@Injectable()
export class BookingRepository implements IBookingRepository {
  constructor(
    @InjectRepository(BookingOrmEntity)  // TypeORM entity
    private readonly bookingRepo: Repository<BookingOrmEntity>,
    private readonly mapper: BookingMapper,  // Domain ↔ ORM mapper
  ) {}

  async save(booking: Booking): Promise<void> {
    // Map Domain Entity → ORM Entity
    const ormEntity = this.mapper.toOrmEntity(booking);
    await this.bookingRepo.save(ormEntity);
  }

  async findById(id: BookingId): Promise<Booking | null> {
    const ormEntity = await this.bookingRepo.findOne({
      where: { id: id.value },
    });
    
    if (!ormEntity) {
      return null;
    }
    
    // Map ORM Entity → Domain Entity
    return this.mapper.toDomain(ormEntity);
  }
}
```

#### Presentation Layer (`presentation/`) - Interface Adapters

**Nguyên tắc Clean Architecture:**
- **Thin layer** - chỉ xử lý HTTP concerns
- **Gọi Application Layer** - không gọi trực tiếp Domain Layer
- **Transform** - Request DTO → Command/Query, Entity → Response DTO

**Components:**

- **Controllers**: REST API endpoints
  - Route handlers
  - Request/Response transformation
  - Validation (sử dụng class-validator)
  - Authentication & Authorization (Guards)
  - Error handling

**Ví dụ Controller (Clean Architecture):**

```typescript
// ✅ CORRECT: Presentation Layer gọi Application Layer
// presentation/controllers/booking.controller.ts
@Controller('bookings')
export class BookingController {
  constructor(
    private readonly createBookingHandler: CreateBookingHandler,  // Application Layer
    private readonly getBookingHandler: GetBookingHandler,        // Application Layer
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Body() dto: CreateBookingDto): Promise<BookingDto> {
    // Transform DTO → Command
    const command = new CreateBookingCommand({
      customerId: dto.customerId,
      roomId: dto.roomId,
      dateRange: DateRange.from(dto.checkInDate, dto.checkOutDate),
      guestInfo: GuestInfo.from(dto.guestInfo),
    });

    // Call Application Layer
    return await this.createBookingHandler.execute(command);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getById(@Param('id') id: string): Promise<BookingDto> {
    const query = new GetBookingQuery({ id });
    return await this.getBookingHandler.execute(query);
  }
}
```

### 3. `app.module.ts` - Root Module

**Mục đích:** Import tất cả modules và cấu hình global.

```typescript
@Module({
  imports: [
    // Common modules
    CommonModule,
    KafkaModule,        // Shared Kafka module
    DatabaseModule,
    CacheModule,
    
    // Bounded contexts
    UserManagementModule,
    CustomerManagementModule,
    AccommodationManagementModule,
    BookingManagementModule,
    PaymentManagementModule,
    // ... other modules
  ],
})
export class AppModule {}
```

### 4. `main.ts` - Application Entry Point

**Mục đích:** Bootstrap NestJS application, cấu hình global (CORS, validation, etc.)

```typescript
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Global configuration
  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalFilters(new AllExceptionsFilter());
  
  await app.listen(3000);
}
```

**Lưu ý quan trọng về Kafka:**

1. **Kafka ở `common/infrastructure/kafka/`**: 
   - Setup và config chung cho toàn bộ application
   - Base producer/consumer services
   - Kafka connection configuration
   - Interfaces và abstractions

2. **Kafka ở mỗi bounded context (`infrastructure/kafka/`)**:
   - Implementation cụ thể cho context đó
   - Publisher: Publish events từ domain của context
   - Consumer: Consume events từ contexts khác (nếu cần)
   - Sử dụng base services từ common

3. **Ví dụ flow:**
   ```
   Booking Context → Domain Event (BookingCreated)
                  → BookingEventPublisher (infrastructure/kafka/)
                  → KafkaProducerService (common/infrastructure/kafka/)
                  → Kafka Topic: booking.created
                  
   Notification Context → KafkaConsumerService (common/infrastructure/kafka/)
                      → NotificationEventConsumer (infrastructure/kafka/)
                      → Send email notification
   ```

**Nguyên tắc thiết kế Bounded Contexts:**

1. **Mỗi Bounded Context là một NestJS Module độc lập**
   - Có thể import/export riêng
   - Dễ test độc lập
   - Dễ tách thành microservice sau

2. **Domain Layer (Core Business Logic)**
   - Entities (Aggregate Roots)
   - Value Objects
   - Domain Services
   - Domain Events
   - Repository Interfaces (không phải implementation)

3. **Application Layer (Use Cases)**
   - Commands (Write operations)
   - Queries (Read operations)
   - Command/Query Handlers
   - DTOs

4. **Infrastructure Layer (Technical Details)**
   - Repository Implementations
   - External Services Integration
   - Database Access (TypeORM/Prisma)
   - Message Queue Integration

5. **Presentation Layer (API)**
   - Controllers
   - Guards, Interceptors, Pipes
   - Request/Response DTOs

**Communication giữa Bounded Contexts:**

- **Synchronous:** Port/Adapter Pattern (Recommended)
  - **Port (Interface):** Định nghĩa trong `application/interfaces/` của module sở hữu dữ liệu
  - **Adapter:** Implement trong `infrastructure/adapters/` của module cần dữ liệu
  - **Nguyên tắc:**
    - Application layer chỉ phụ thuộc vào interface (Port), không import từ module khác
    - Infrastructure layer xử lý giao tiếp giữa các module (Adapter)
    - Module sở hữu dữ liệu export Port, không export service trực tiếp
    - Module cần dữ liệu tạo Adapter trong infrastructure layer
  - **Ví dụ RBAC-User Communication:**
    - RBAC module export `ROLE_PERMISSION_VALIDATION_PORT` để User module validate roles/permissions
    - User module export `USER_ROLE_PERMISSION_PORT` để RBAC module cập nhật user roles/permissions
    - User module sử dụng local value objects (`UserRole`, `UserPermission`) để tránh phụ thuộc domain
    - RBAC module sử dụng domain entities (`Role`) và value objects (`Permission`)
  - **Ví dụ:**
    ```typescript
    // User Module - application/interfaces/user-authentication.port.ts
    export interface IUserAuthenticationPort {
      findForAuthentication(email: Email): Promise<UserAuthenticationData | null>;
    }
    export const USER_AUTHENTICATION_PORT = 'USER_AUTHENTICATION_PORT';
    
    // User Module - infrastructure/services/user-authentication.service.ts
    @Injectable()
    export class UserAuthenticationService implements IUserAuthenticationPort {
      // Implementation
    }
    
    // User Module - user.module.ts
    @Module({
      providers: [
        { provide: USER_AUTHENTICATION_PORT, useClass: UserAuthenticationService },
      ],
      exports: [USER_AUTHENTICATION_PORT], // Export port, not service
    })
    export class UserModule {}
    
    // Auth Module - application/interfaces/user-authentication.service.interface.ts
    export interface IUserAuthenticationService {
      findForAuthentication(email: Email): Promise<UserAuthenticationData | null>;
    }
    
    // Auth Module - infrastructure/adapters/user-authentication.adapter.ts
    @Injectable()
    export class UserAuthenticationAdapter implements IUserAuthenticationService {
      constructor(
        @Inject(USER_AUTHENTICATION_PORT)
        private readonly userAuthPort: IUserAuthenticationPort,
      ) {}
      // Adapts user module port to auth module interface
    }
    
    // Auth Module - application/commands/handlers/authenticate-user.handler.ts
    @CommandHandler(AuthenticateUserCommand)
    export class AuthenticateUserHandler {
      constructor(
        @Inject(USER_AUTHENTICATION_SERVICE)
        private readonly userAuthService: IUserAuthenticationService, // Only depends on interface
      ) {}
    }
    ```
- **Asynchronous:** Domain Events qua Kafka (loose coupling)
- **Shared Kernel:** Common code trong `common/` folder

**Migration Path sang Microservices:**

1. **Phase 1 (Modular Monolith):** Tất cả trong 1 app, shared database
2. **Phase 2 (Database per Context):** Tách database, vẫn trong 1 app
3. **Phase 3 (Extract Services):** Tách các bounded contexts thành services riêng
4. **Phase 4 (Full Microservices):** Mỗi service deploy độc lập

**Khi nào chuyển sang Microservices:**
- Team > 20 developers
- Cần scale độc lập từng service
- Có nhiều teams làm việc độc lập
- Cần deploy độc lập

**Ví dụ Module chi tiết (Booking Management):**

```typescript
// src/bounded-contexts/booking-management/booking.module.ts
@Module({
  imports: [
    TypeOrmModule.forFeature([BookingOrmEntity]),
    CqrsModule, // Cho CQRS pattern
    EventEmitterModule, // Cho Domain Events
  ],
  controllers: [BookingController],
  providers: [
    // Domain Services
    BookingFactory,
    BookingAvailabilityService,
    
    // Application Services
    CreateBookingHandler,
    GetBookingHandler,
    CancelBookingHandler,
    
    // Infrastructure
    { provide: 'IBookingRepository', useClass: BookingRepository },
    { provide: 'IPaymentRepository', useClass: PaymentRepository },
    
    // Event Handlers
    BookingCreatedHandler,
    BookingConfirmedHandler,
    
    // Saga
    BookingSaga,
  ],
  exports: [
    'IBookingRepository',
    BookingFactory,
    BookingAvailabilityService,
  ],
})
export class BookingModule {}
```

**ORM Options:**

- **TypeORM** (Recommended cho NestJS)
  - Native NestJS integration
  - Decorator-based entities
  - Migration support
  - Active Record và Data Mapper patterns
  
- **Prisma** (Alternative)
  - Type-safe queries
  - Excellent developer experience
  - Auto-generated types
  - Migration tool mạnh

**Recommendation:** TypeORM cho giai đoạn đầu (dễ tích hợp với NestJS), có thể xem xét Prisma nếu team thích type safety cao hơn.

## 4. Design Patterns

### 4.1. Repository Pattern

**Mục đích:** Abstraction cho data access, dễ test và maintain

```typescript
// Domain Layer - Repository Interface
export interface IBookingRepository {
  save(booking: Booking): Promise<void>;
  findById(id: BookingId): Promise<Booking | null>;
  findByCustomerId(customerId: CustomerId): Promise<Booking[]>;
  findAvailableRooms(
    dateRange: DateRange,
    roomTypeId: RoomTypeId
  ): Promise<Room[]>;
}

// Infrastructure Layer - Repository Implementation
@Injectable()
export class BookingRepository implements IBookingRepository {
  constructor(
    @InjectRepository(BookingOrmEntity)
    private readonly bookingRepo: Repository<BookingOrmEntity>,
  ) {}

  async save(booking: Booking): Promise<void> {
    const ormEntity = BookingMapper.toOrmEntity(booking);
    await this.bookingRepo.save(ormEntity);
  }

  async findById(id: BookingId): Promise<Booking | null> {
    const ormEntity = await this.bookingRepo.findOne({
      where: { id: id.value },
    });
    return ormEntity ? BookingMapper.toDomain(ormEntity) : null;
  }

  // ... other methods
}
```

### 4.2. Unit of Work Pattern

**Mục đích:** Quản lý transactions, đảm bảo consistency

**Với NestJS:** Sử dụng TypeORM Transaction hoặc DataSource transaction

```typescript
// Sử dụng TypeORM Transaction
@Injectable()
export class BookingService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly bookingRepo: IBookingRepository,
    private readonly paymentRepo: IPaymentRepository,
  ) {}

  async createBooking(command: CreateBookingCommand): Promise<Booking> {
    return await this.dataSource.transaction(async (manager) => {
      // Tất cả operations trong transaction
      const booking = Booking.create(...);
      await this.bookingRepo.save(booking, manager);
      
      const payment = Payment.create(...);
      await this.paymentRepo.save(payment, manager);
      
      return booking;
    });
  }
}
```

### 4.3. Specification Pattern

**Mục đích:** Encapsulate business rules, reusable queries

```typescript
// Domain Layer
export interface Specification<T> {
  isSatisfiedBy(candidate: T): boolean;
}

export class AvailableRoomSpecification implements Specification<Room> {
  constructor(
    private readonly dateRange: DateRange,
    private readonly numberOfGuests: number,
  ) {}

  isSatisfiedBy(room: Room): boolean {
    return (
      room.isAvailable(this.dateRange) &&
      room.canAccommodate(this.numberOfGuests)
    );
  }
}

// Usage
const spec = new AvailableRoomSpecification(dateRange, 2);
const availableRooms = rooms.filter((room) => spec.isSatisfiedBy(room));
```

### 4.4. Factory Pattern

**Mục đích:** Tạo complex objects (Aggregates)

```typescript
// Domain Layer
@Injectable()
export class BookingFactory {
  constructor(
    private readonly eventBus: EventBus,
    private readonly roomAvailabilityService: RoomAvailabilityService,
  ) {}

  async create(
    customerId: CustomerId,
    accommodationId: AccommodationId,
    roomId: RoomId,
    dateRange: DateRange,
    guestInfo: GuestInfo,
  ): Promise<Booking> {
    // Validate business rules
    await this.roomAvailabilityService.checkAvailability(
      roomId,
      dateRange,
    );

    // Create Booking aggregate
    const booking = Booking.create({
      customerId,
      accommodationId,
      roomId,
      dateRange,
      guestInfo,
    });

    // Raise domain events
    booking.getDomainEvents().forEach((event) => {
      this.eventBus.publish(event);
    });

    return booking;
  }
}
```

### 4.5. Strategy Pattern

**Mục đích:** Tính giá động, payment methods

```typescript
// Domain Layer
export interface PricingStrategy {
  calculatePrice(room: Room, dateRange: DateRange): Money;
}

@Injectable()
export class SeasonalPricingStrategy implements PricingStrategy {
  calculatePrice(room: Room, dateRange: DateRange): Money {
    // Logic tính giá theo mùa
    return room.basePrice.multiply(seasonalMultiplier);
  }
}

@Injectable()
export class WeeklyPricingStrategy implements PricingStrategy {
  calculatePrice(room: Room, dateRange: DateRange): Money {
    // Logic tính giá theo ngày trong tuần
    return room.basePrice.multiply(weeklyMultiplier);
  }
}

// Usage với Dependency Injection
@Injectable()
export class PriceCalculationService {
  constructor(
    @Inject('PricingStrategy')
    private readonly strategies: PricingStrategy[],
  ) {}

  calculateFinalPrice(room: Room, dateRange: DateRange): Money {
    // Áp dụng strategy có priority cao nhất
    return this.strategies
      .map((strategy) => strategy.calculatePrice(room, dateRange))
      .reduce((max, price) => (price.amount > max.amount ? price : max));
  }
}
```

### 4.6. Saga Pattern

**Mục đích:** Quản lý long-running transactions (Booking → Payment → Revenue)

```typescript
// Application Layer
@Injectable()
export class BookingSaga {
  constructor(
    private readonly bookingService: BookingService,
    private readonly paymentService: PaymentService,
    private readonly revenueService: RevenueService,
    private readonly eventBus: EventBus,
  ) {}

  @Saga()
  async handleBookingCreated(event: BookingCreatedEvent) {
    // Step 1: Create Payment
    const payment = await this.paymentService.initiate({
      bookingId: event.bookingId,
      amount: event.totalAmount,
    });

    // Step 2: Wait for payment confirmation (via event)
    // Handled by PaymentSucceededHandler
  }

  @Saga()
  async handlePaymentSucceeded(event: PaymentSucceededEvent) {
    // Step 3: Create Revenue record
    await this.revenueService.create({
      bookingId: event.bookingId,
      amount: event.amount,
    });

    // Step 4: Confirm Booking
    await this.bookingService.confirm(event.bookingId);
  }

  @Saga()
  async handlePaymentFailed(event: PaymentFailedEvent) {
    // Compensation: Cancel Booking
    await this.bookingService.cancel(event.bookingId);
  }
}
```

### 4.7. Observer Pattern (Domain Events)

**Mục đích:** Loose coupling giữa aggregates

```typescript
// Domain Layer
export class Booking extends AggregateRoot {
  private domainEvents: DomainEvent[] = [];

  confirm(): void {
    this.status = BookingStatus.CONFIRMED;
    this.raiseEvent(new BookingConfirmedEvent(this.id));
  }

  raiseEvent(event: DomainEvent): void {
    this.domainEvents.push(event);
  }

  getDomainEvents(): DomainEvent[] {
    return this.domainEvents;
  }

  clearEvents(): void {
    this.domainEvents = [];
  }
}

// Application Layer - Event Handler
@EventsHandler(BookingConfirmedEvent)
export class BookingConfirmedHandler {
  constructor(
    private readonly notificationService: NotificationService,
    private readonly revenueService: RevenueService,
  ) {}

  async handle(event: BookingConfirmedEvent) {
    // Send notification
    await this.notificationService.sendBookingConfirmation(event.bookingId);

    // Create revenue record
    await this.revenueService.createFromBooking(event.bookingId);
  }
}
```

### 4.8. Decorator Pattern

**Mục đích:** Thêm tính năng không ảnh hưởng core logic (logging, caching)

**Với NestJS:** Sử dụng Interceptors

```typescript
// Cache Interceptor
@Injectable()
export class CacheInterceptor implements NestInterceptor {
  constructor(private readonly cacheManager: Cache) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const cacheKey = `booking:${request.params.id}`;

    const cached = await this.cacheManager.get(cacheKey);
    if (cached) {
      return of(cached);
    }

    return next.handle().pipe(
      tap(async (data) => {
        await this.cacheManager.set(cacheKey, data, { ttl: 300 });
      }),
    );
  }
}

// Usage
@Controller('bookings')
@UseInterceptors(CacheInterceptor)
export class BookingController {
  // ...
}
```

## 5. Database Design

### 5.1. Database Strategy

**Primary Database: PostgreSQL**
- ACID compliance
- Complex queries
- JSON support cho flexible data

**Read Replicas:**
- Cho read-heavy operations (search, reports)
- Reduce load trên primary database

**Caching Strategy:**
- Redis cho hot data (pricing, availability)
- Cache invalidation strategy

### 5.2. Database Schema Patterns

**Single Table Inheritance (cho Accommodation):**
```sql
CREATE TABLE accommodations (
    id UUID PRIMARY KEY,
    type VARCHAR(20) NOT NULL, -- 'homestay' or 'hotel'
    name VARCHAR(255) NOT NULL,
    -- Common fields
    star_rating INTEGER, -- NULL for homestay
    total_floors INTEGER, -- NULL for homestay
    -- ...
    CHECK (type IN ('homestay', 'hotel'))
);
```

**Class Table Inheritance (Alternative):**
- Base table `accommodations`
- Separate tables `homestays`, `hotels`
- JOIN khi cần

**Event Sourcing (cho critical aggregates):**
```sql
CREATE TABLE booking_events (
    id UUID PRIMARY KEY,
    booking_id UUID NOT NULL,
    event_type VARCHAR(50) NOT NULL,
    event_data JSONB NOT NULL,
    occurred_at TIMESTAMP NOT NULL
);
```

### 5.3. Indexing Strategy

**Critical Indexes:**
- `bookings(customer_id, status, created_at)`
- `bookings(accommodation_id, check_in_date, check_out_date)`
- `rooms(accommodation_id, status)`
- `pricing(room_id, date)`
- `accommodations(location) GIST` (PostGIS cho geospatial)

### 5.4. Data Partitioning

**Partitioning Strategy:**
- Partition `bookings` table theo `created_at` (monthly/yearly)
- Partition `payments` table theo `paid_at`
- Improve query performance cho historical data

## 6. API Design

### 6.1. RESTful API

**Conventions:**
- Resource-based URLs
- HTTP verbs (GET, POST, PUT, PATCH, DELETE)
- Status codes
- Versioning: `/api/v1/`

**Examples:**
```
GET    /api/v1/accommodations
GET    /api/v1/accommodations/{id}
POST   /api/v1/bookings
GET    /api/v1/bookings/{id}
PATCH  /api/v1/bookings/{id}/cancel
POST   /api/v1/payments
```

## 7. Security Architecture

### 7.1. Authentication & Authorization

**Authentication:**
- JWT tokens (stateless)
- Refresh tokens
- OAuth2 (cho third-party integration)

**Authorization:**
- RBAC (Role-Based Access Control) với Role là Domain Entity
- **Role Management:**
  - Role là Domain Entity với CRUD operations
  - Role có field `is_super_admin` để đánh dấu role mặc định
  - Role có relationship many-to-many với Permission
  - Super Admin role không thể xóa
- **Permission Management:**
  - Permission là Value Object (catalog được seed sẵn)
  - Không có CRUD cho Permission
- **Permission Checking (Real-time):**
  - `PermissionsGuard` load roles và permissions từ database khi check (real-time)
  - Merge permissions từ roles và permissions trực tiếp của user
  - Không cần đăng nhập lại khi gán permissions mới cho role
- Guards trong NestJS (`RolesGuard`, `PermissionsGuard`)
- Decorators:
  - `@Permissions()`: Định nghĩa permissions yêu cầu (chính, quyền động từ database)
  - `@Roles()`: Định nghĩa roles yêu cầu (optional, backward compatibility)
- Resource-level permissions
- **User-Role-Permission Relationship:**
  - User có thể có nhiều roles
  - User có thể có permissions trực tiếp (ngoài permissions từ roles)
  - Permissions từ roles được merge với permissions trực tiếp khi check quyền

### 7.2. Data Security

**Encryption:**
- At rest: Database encryption
- In transit: TLS/SSL
- Sensitive data: Payment info, passwords (bcrypt/argon2)

**PCI DSS Compliance:**
- Không lưu full card numbers
- Tokenization cho payment data
- Secure payment gateway integration

### 7.3. API Security

**Rate Limiting:**
- Per user/IP
- Per endpoint
- Sliding window algorithm

**Input Validation:**
- Sanitize all inputs
- SQL injection prevention (ORM)
- XSS prevention
- CSRF protection

## 8. Performance Optimization

### 8.1. Caching Strategy

**Multi-layer Caching:**
1. **Application Cache (Redis):**
   - Search results
   - Pricing data
   - User sessions
   
2. **Database Query Cache:**
   - Frequently accessed data
   
3. **CDN (CloudFront):**
   - Static assets
   - Images
   - API responses (if cacheable)

**Cache Invalidation:**
- Event-driven invalidation
- TTL-based expiration
- Manual invalidation

### 8.2. Database Optimization

**Query Optimization:**
- Proper indexing
- Query analysis và optimization
- Avoid N+1 queries (eager loading)
- Database query caching

**Connection Pooling:**
- PgBouncer cho PostgreSQL
- Redis connection pool

### 8.3. Async Processing

**Background Jobs:**
- Email sending
- Report generation
- Image processing
- Notification sending

**Queue Workers:**
- Multiple workers cho parallel processing
- Priority queues
- Failed job handling

## 9. Monitoring & Observability

### 9.1. Logging

**Structured Logging:**
- JSON format
- Log levels (DEBUG, INFO, WARN, ERROR)
- Context information (user_id, request_id)
- Centralized logging (ELK Stack)

### 9.2. Metrics

**Key Metrics:**
- Request rate
- Response time (p50, p95, p99)
- Error rate
- Database query performance
- Queue processing time
- Cache hit rate

**Tools:**
- Prometheus + Grafana
- New Relic / Datadog

### 9.3. Distributed Tracing

**Purpose:**
- Track requests across services
- Identify bottlenecks
- Debug distributed systems

**Tools:**
- Jaeger
- Zipkin
- AWS X-Ray

## 10. Testing Strategy

### 10.1. Test Pyramid

```
        /\
       /  \  E2E Tests (10%)
      /____\
     /      \  Integration Tests (20%)
    /________\
   /          \  Unit Tests (70%)
  /____________\
```

### 10.2. Testing Types

**Unit Tests:**
- Domain logic
- Value Objects
- Domain Services
- Business rules

**Integration Tests:**
- Repository implementations
- API endpoints
- Database interactions

**E2E Tests:**
- Critical user flows
- Booking process
- Payment flow

**Tools:**
- Jest (Backend & Frontend)
- Supertest (API testing)
- Cypress / Playwright (E2E)

## 11. Deployment Strategy

### 11.1. Environment Setup

**Environments:**
- Development
- Staging
- Production



### 11.2. CI/CD Pipeline

**Pipeline Stages:**
1. Code checkout
2. Run tests
3. Build Docker images
4. Security scanning
5. Deploy to staging
6. Run E2E tests
7. Deploy to production (manual approval)

**Blue-Green Deployment:**
- Zero-downtime deployments
- Quick rollback capability

### 11.3. Database Migrations

**Strategy:**
- Version-controlled migrations
- Backward compatible changes
- Rollback scripts
- Migration testing

## 12. Scalability Considerations

### 12.1. Horizontal Scaling

**Application Servers:**
- Stateless application
- Load balancer (Nginx, HAProxy)
- Session storage in Redis

**Database:**
- Read replicas
- Connection pooling
- Sharding (nếu cần)

### 12.2. Vertical Scaling

**When to use:**
- Initial phase
- Small to medium traffic
- Cost-effective

### 12.3. Microservices Migration Path

**Phases:**
1. Modular Monolith (Phase 1)
2. Extract services: Payment, Notification (Phase 2)
3. Extract services: Search, Reporting (Phase 3)
4. Full microservices (Phase 4)

## 13. Disaster Recovery & Backup

### 13.1. Backup Strategy

**Database Backups:**
- Daily full backups
- Hourly incremental backups
- Point-in-time recovery
- Backup retention: 30 days

**File Backups:**
- Images, documents
- S3 versioning
- Cross-region replication

### 13.2. Disaster Recovery Plan

**RTO (Recovery Time Objective):** 4 hours
**RPO (Recovery Point Objective):** 1 hour

**Procedures:**
- Automated failover
- Database replication
- Multi-region deployment (nếu cần)

## 14. Third-party Integrations

### 14.1. Payment Gateways

**Integration Pattern:**
- Adapter pattern
- Multiple gateway support
- Webhook handling
- Retry mechanism

**Gateways:**
- VNPay
- MoMo
- ZaloPay
- Stripe

### 14.2. External Services

**Email Service:**
- SendGrid / Mailgun / AWS SES
- Template management
- Delivery tracking

**SMS Service:**
- Twilio / AWS SNS
- OTP delivery
- Notification SMS

**Maps:**
- Google Maps API
- Mapbox
- Geocoding
- Distance calculation

## 15. Development Best Practices

### 15.1. Code Organization

**DDD Structure (NestJS):**
```
src/
├── bounded-contexts/
│   ├── user-management/
│   │   ├── domain/
│   │   │   ├── entities/
│   │   │   │   └── user.entity.ts (Aggregate Root)
│   │   │   ├── repositories/
│   │   │   │   └── user.repository.interface.ts
│   │   │   └── events/
│   │   ├── application/
│   │   ├── infrastructure/
│   │   └── presentation/
│   └── booking-management/
│       └── ...
├── common/
└── app.module.ts
```

### 15.2. Coding Standards

- **TypeScript:** Strict mode enabled
- **ESLint + Prettier:** Code formatting và linting
- **Type hints:** Explicit types cho tất cả functions và variables
- **JSDoc:** Documentation cho public APIs
- **SOLID principles:** Object-oriented design principles
- **NestJS conventions:** Follow NestJS style guide

### 15.3. Documentation

- API documentation (OpenAPI/Swagger)
- Architecture Decision Records (ADRs)
- Domain documentation
- Deployment guides

## 16. Cost Optimization

### 16.1. Infrastructure Costs

**Strategies:**
- Right-sizing instances
- Reserved instances
- Auto-scaling
- CDN cho static assets
- Database optimization

### 16.2. Development Costs

- Open-source tools
- Managed services (RDS, ElastiCache)
- Serverless cho non-critical services

## 17. Roadmap & Phases

### Phase 1: MVP (3-4 tháng)
- Core booking functionality
- Basic payment integration
- Admin panel
- Customer frontend

### Phase 2: Enhancement (2-3 tháng)
- Advanced search (Elasticsearch)
- Reviews & ratings
- Promotions
- Reporting

### Phase 3: Advanced Features (2-3 tháng)
- Hotel services booking
- Standalone service booking
- Advanced analytics
- Mobile app (nếu cần)

### Phase 4: Scale & Optimize (Ongoing)
- Performance optimization
- Microservices migration (nếu cần)
- Advanced monitoring
- Multi-region deployment

## 18. Các quyết định kiến trúc quan trọng

### 18.1. Tại sao chọn Modular Monolith thay vì Microservices?

**Lý do:**
1. **Team size:** Với team nhỏ/trung bình, monolith dễ quản lý hơn
2. **Transaction management:** Shared database giúp quản lý transactions dễ dàng (ACID)
3. **Development speed:** Không cần service discovery, API gateway phức tạp
4. **Cost:** Ít infrastructure overhead
5. **Migration path:** Có thể tách thành microservices sau khi cần

**Khi nào chuyển sang Microservices:**
- Team > 20 developers
- Cần scale độc lập từng service
- Có nhiều teams làm việc độc lập
- Cần deploy độc lập

### 18.2. Tại sao chọn PostgreSQL?

**Lý do:**
1. **ACID compliance:** Quan trọng cho financial transactions
2. **JSON support:** Flexible cho dynamic data
3. **Full-text search:** Built-in capabilities
4. **PostGIS:** Geospatial queries cho maps
5. **Mature & stable:** Production-ready
6. **Open source:** Không có vendor lock-in

### 18.3. Tại sao chọn CQRS?

**Lý do:**
1. **Read/Write separation:** Tối ưu cho từng loại operation
2. **Scalability:** Scale read và write độc lập
3. **Performance:** Read models có thể denormalized
4. **DDD alignment:** Phù hợp với DDD principles

**Trade-offs:**
- Complexity tăng
- Eventual consistency
- Cần quản lý read models

### 18.4. Tại sao chọn Event-Driven Architecture?

**Lý do:**
1. **Loose coupling:** Aggregates không phụ thuộc trực tiếp
2. **Scalability:** Async processing
3. **Audit trail:** Lưu trữ events
4. **Flexibility:** Dễ thêm handlers mới

**Use cases:**
- Domain events distribution
- Async notifications
- Analytics updates
- Integration với external systems

## 19. Rủi ro và giảm thiểu

### 19.1. Technical Risks

**Risk: Database bottleneck**
- **Mitigation:** Read replicas, caching, query optimization

**Risk: Payment gateway downtime**
- **Mitigation:** Multiple gateways, retry mechanism, fallback

**Risk: High traffic spikes**
- **Mitigation:** Auto-scaling, CDN, rate limiting

### 19.2. Business Risks

**Risk: Data loss**
- **Mitigation:** Regular backups, point-in-time recovery

**Risk: Security breach**
- **Mitigation:** Security best practices, regular audits, monitoring

**Risk: Vendor lock-in**
- **Mitigation:** Abstraction layers, open-source tools

## 20. Kết luận

Kiến trúc này được thiết kế dựa trên:
- **Domain-Driven Design** với 13 Aggregate Roots
- **Best practices** từ industry
- **Scalability** và **maintainability**
- **Security** và **performance**

**Lưu ý:** Kiến trúc này có thể điều chỉnh dựa trên:
- Team size và skills
- Budget constraints
- Timeline
- Business requirements thay đổi

**Next Steps:**
1. Setup development environment
2. Implement core aggregates
3. Build API endpoints
4. Setup CI/CD
5. Deploy to staging
6. Testing và optimization

---

**Tài liệu này sẽ được cập nhật thường xuyên dựa trên feedback và thay đổi requirements.**

