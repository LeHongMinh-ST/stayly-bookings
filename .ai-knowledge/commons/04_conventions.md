# Conventions & Best Practices - Homestay & Hotel Booking System

## 1. Tổng quan

Tài liệu này định nghĩa các conventions và best practices cho dự án Homestay & Hotel Booking System, đảm bảo tính nhất quán, dễ đọc và dễ maintain trong toàn bộ codebase.

**Nguyên tắc:**
- **Consistency:** Nhất quán trong toàn bộ dự án
- **Clarity:** Rõ ràng, dễ hiểu
- **Maintainability:** Dễ bảo trì và mở rộng
- **SOLID Principles:** Tuân thủ các nguyên tắc SOLID
- **Clean Architecture:** Tuân thủ Clean Architecture principles
- **DDD:** Tuân thủ Domain-Driven Design principles

---

## 2. Naming Conventions

### 2.1. File Naming

**TypeScript Files:**
- **Entities:** `{name}.entity.ts` (ví dụ: `user.entity.ts`, `booking.entity.ts`)
- **Value Objects:** `{name}.vo.ts` (ví dụ: `email.vo.ts`, `money.vo.ts`)
- **Repositories (Interface):** `{name}.repository.interface.ts` (ví dụ: `user.repository.interface.ts`)
- **Repositories (Implementation):** `{name}.repository.ts` (ví dụ: `user.repository.ts`)
- **ORM Entities:** `{name}.orm-entity.ts` (ví dụ: `user.orm-entity.ts`)
- **Commands:** `{name}.command.ts` (ví dụ: `create-booking.command.ts`)
- **Command Handlers:** `{name}.handler.ts` (ví dụ: `create-booking.handler.ts`)
- **Queries:** `{name}.query.ts` (ví dụ: `get-booking.query.ts`)
- **Query Handlers:** `{name}.handler.ts` (ví dụ: `get-booking.handler.ts`)
- **DTOs:** `{name}.dto.ts` (ví dụ: `create-booking.dto.ts`)
- **Controllers:** `{name}.controller.ts` (ví dụ: `booking.controller.ts`)
- **Services:** `{name}.service.ts` (ví dụ: `booking.service.ts`)
- **Modules:** `{name}.module.ts` (ví dụ: `booking.module.ts`)
- **Guards:** `{name}.guard.ts` (ví dụ: `jwt-auth.guard.ts`)
- **Interceptors:** `{name}.interceptor.ts` (ví dụ: `logging.interceptor.ts`)
- **Pipes:** `{name}.pipe.ts` (ví dụ: `validation.pipe.ts`)
- **Filters:** `{name}.filter.ts` (ví dụ: `http-exception.filter.ts`)
- **Events:** `{name}.event.ts` (ví dụ: `booking-created.event.ts`)
- **Mappers:** `{name}.mapper.ts` (ví dụ: `booking.mapper.ts`)
- **Ports (Interfaces):** `{entity}-{purpose}.port.ts` (ví dụ: `user-authentication.port.ts`)
- **Adapters:** `{entity}-{purpose}.adapter.ts` (ví dụ: `user-authentication.adapter.ts`)

**Naming Pattern:**
- Sử dụng **kebab-case** cho file names
- Sử dụng **descriptive names** - tên file phải mô tả rõ nội dung

### 2.2. Class Naming

**Conventions:**
- **Entities (Domain):** `PascalCase` (ví dụ: `User`, `Booking`, `Accommodation`)
- **Value Objects:** `PascalCase` (ví dụ: `Email`, `Money`, `DateRange`)
- **Aggregate Roots:** `PascalCase` (ví dụ: `Booking`, `User`, `Customer`)
- **Repositories (Interface):** `I{Name}Repository` (ví dụ: `IBookingRepository`, `IUserRepository`)
- **Repositories (Implementation):** `{Name}Repository` (ví dụ: `BookingRepository`, `UserRepository`)
- **Commands:** `{Action}{Entity}Command` (ví dụ: `CreateBookingCommand`, `CancelBookingCommand`)
- **Command Handlers:** `{Action}{Entity}Handler` (ví dụ: `CreateBookingHandler`, `CancelBookingHandler`)
- **Queries:** `{Action}{Entity}Query` (ví dụ: `GetBookingQuery`, `SearchAccommodationsQuery`)
- **Query Handlers:** `{Action}{Entity}Handler` (ví dụ: `GetBookingHandler`, `SearchAccommodationsHandler`)
- **DTOs:** `{Action}{Entity}Dto` (ví dụ: `CreateBookingDto`, `BookingResponseDto`)
- **Controllers:** `{Entity}Controller` (ví dụ: `BookingController`, `UserController`)
- **Services:** `{Entity}Service` hoặc `{Purpose}Service` (ví dụ: `BookingService`, `PriceCalculationService`)
- **Guards:** `{Purpose}Guard` (ví dụ: `JwtAuthGuard`, `RolesGuard`)
- **Interceptors:** `{Purpose}Interceptor` (ví dụ: `LoggingInterceptor`, `CacheInterceptor`)
- **Events:** `{Entity}{Action}Event` (ví dụ: `BookingCreatedEvent`, `PaymentSucceededEvent`)
- **Exceptions:** `{Purpose}Error` hoặc `{Purpose}Exception` (ví dụ: `RoomNotFoundError`, `InvalidBookingStatusError`)
- **Ports (Interfaces):** `I{Entity}{Purpose}Port` (ví dụ: `IUserAuthenticationPort`)
- **Port Tokens:** `{ENTITY}_{PURPOSE}_PORT` (ví dụ: `USER_AUTHENTICATION_PORT`)
- **Adapters:** `{Entity}{Purpose}Adapter` (ví dụ: `UserAuthenticationAdapter`)
- **Module Interfaces:** `I{Entity}{Purpose}Service` (trong module cần dữ liệu, ví dụ: `IUserAuthenticationService`)

### 2.3. Variable & Function Naming

**Conventions:**
- **Variables:** `camelCase` (ví dụ: `bookingId`, `customerName`, `totalAmount`)
- **Constants:** `UPPER_SNAKE_CASE` (ví dụ: `MAX_BOOKING_DURATION`, `DEFAULT_COMMISSION_RATE`)
- **Private properties:** `private readonly {name}` hoặc `private {name}` (ví dụ: `private readonly bookingRepo`, `private status`)
- **Functions/Methods:** `camelCase` với động từ (ví dụ: `createBooking()`, `calculatePrice()`, `validateEmail()`)
- **Boolean variables:** Prefix với `is`, `has`, `can`, `should` (ví dụ: `isAvailable`, `hasPermission`, `canCancel`, `shouldRefund`)
- **Arrays/Collections:** Plural form (ví dụ: `bookings`, `users`, `rooms`)

**Examples:**
```typescript
// ✅ CORRECT
const bookingId: BookingId = BookingId.generate();
const isAvailable: boolean = room.isAvailable(dateRange);
const bookings: Booking[] = await this.bookingRepo.findAll();

// ❌ WRONG
const booking_id: string = '123';
const available: boolean = true;
const bookingList: Booking[] = [];
```

### 2.4. Database Naming

**Table Names:**
- **Plural form, snake_case** (ví dụ: `users`, `bookings`, `accommodations`)
- **Consistent naming:** Tên bảng phải match với Aggregate Root name

**Column Names:**
- **snake_case** (ví dụ: `user_id`, `booking_code`, `check_in_date`, `created_at`)
- **Foreign keys:** `{referenced_table}_id` (ví dụ: `user_id`, `booking_id`, `accommodation_id`)
- **Timestamps:** `created_at`, `updated_at`, `deleted_at`
- **Status fields:** `status` (ví dụ: `status`, `payment_status`, `booking_status`)

**Index Names:**
- `idx_{table}_{columns}` (ví dụ: `idx_bookings_customer_id_status`, `idx_rooms_accommodation_id`)

**Constraint Names:**
- **Primary Key:** `pk_{table}` (ví dụ: `pk_bookings`)
- **Foreign Key:** `fk_{table}_{referenced_table}` (ví dụ: `fk_bookings_customer_id`)
- **Unique:** `uk_{table}_{column}` (ví dụ: `uk_users_email`)
- **Check:** `ck_{table}_{column}` (ví dụ: `ck_bookings_check_out_after_check_in`)

---

## 3. Code Organization Conventions

### 3.1. Directory Structure

**Bounded Context Structure:**
```
bounded-contexts/
└── {context-name}/
    ├── {context}.module.ts
    ├── domain/
    │   ├── entities/
    │   ├── value-objects/
    │   ├── repositories/
    │   ├── services/
    │   └── events/
    ├── application/
    │   ├── commands/
    │   │   ├── {command}.command.ts
    │   │   └── handlers/
    │   │       └── {command}.handler.ts
    │   ├── queries/
    │   │   ├── {query}.query.ts
    │   │   └── handlers/
    │   │       └── {query}.handler.ts
    │   ├── interfaces/          # Port interfaces for other modules
    │   │   └── {entity}-{purpose}.port.ts
    │   └── dto/
    ├── infrastructure/
    │   ├── persistence/
    │   │   ├── repositories/
    │   │   └── entities/
    │   ├── adapters/            # Adapters for other modules (Port/Adapter Pattern)
    │   │   └── {entity}-{purpose}.adapter.ts
    │   ├── services/             # Services implementing ports
    │   │   └── {entity}-{purpose}.service.ts
    │   ├── kafka/
    │   └── external/
    └── presentation/
        └── controllers/
```

**Common Structure:**
```
common/
├── decorators/
├── guards/
├── interceptors/
├── pipes/
├── filters/
├── utils/
└── infrastructure/
    ├── kafka/
    ├── database/
    ├── cache/
    └── logger/
```

### 3.2. Import Order

**Convention:**
1. External libraries (NestJS, TypeORM, etc.)
2. Internal modules (from `common/`)
3. Same bounded context imports
4. Types/interfaces

**Example:**
```typescript
// 1. External libraries
import { Injectable, Inject } from '@nestjs/common';
import { Repository } from 'typeorm';

// 2. Common modules
import { Logger } from '../../common/logger/logger.service';
import { IEventPublisher } from '../../common/infrastructure/kafka/interfaces/event-publisher.interface';

// 3. Same context
import { Booking } from '../../domain/entities/booking.entity';
import { IBookingRepository } from '../../domain/repositories/booking.repository.interface';

// 4. Types
import { BookingId } from '../../domain/value-objects/booking-id.vo';
```

### 3.3. Export Conventions

**Public API:**
- Export only what is needed by other modules
- Use `export` for public APIs
- Use `export default` sparingly (prefer named exports)

**Example:**
```typescript
// ✅ CORRECT: Named exports
export class Booking { }
export interface IBookingRepository { }
export class BookingCreatedEvent { }

// ❌ WRONG: Default export (trừ khi thực sự cần)
export default class Booking { }
```

---

## 4. Clean Architecture Conventions

### 4.1. Dependency Rule

**Nguyên tắc:**
- **Dependencies chỉ hướng vào trong (inward)**
- **Outer layers phụ thuộc vào inner layers**
- **Inner layers KHÔNG BAO GIỜ phụ thuộc vào outer layers**

**Layer Dependencies:**
```
Presentation → Application → Domain
Infrastructure → Application → Domain
```

**Examples:**
```typescript
// ✅ CORRECT: Presentation → Application
@Controller('bookings')
export class BookingController {
  constructor(
    private readonly createBookingHandler: CreateBookingHandler  // Application Layer
  ) {}
}

// ✅ CORRECT: Application → Domain
@CommandHandler(CreateBookingCommand)
export class CreateBookingHandler {
  constructor(
    @Inject('IBookingRepository')  // Domain Interface
    private readonly bookingRepo: IBookingRepository,
  ) {}
}

// ❌ WRONG: Domain → Infrastructure
export class Booking {
  // ❌ KHÔNG được inject TypeORM Repository
  // ❌ KHÔNG được import từ infrastructure/
}
```

### 4.2. Domain Layer Conventions

**Pure TypeScript:**
- Không import NestJS decorators (trừ khi cần cho DI)
- Không import TypeORM, Kafka, hoặc external libraries
- Chỉ có business logic thuần túy

**Entity Conventions:**
```typescript
// ✅ CORRECT: Pure domain entity
export class Booking {
  private constructor(
    private readonly id: BookingId,
    private status: BookingStatus,
    // ...
  ) {}

  static create(props: CreateBookingProps): Booking {
    // Business rules validation
    if (!props.dateRange.isValid()) {
      throw new InvalidDateRangeError();
    }
    return new Booking(/* ... */);
  }

  confirm(): void {
    if (this.status !== BookingStatus.PENDING_PAYMENT) {
      throw new InvalidBookingStatusError();
    }
    this.status = BookingStatus.CONFIRMED;
    this.raiseEvent(new BookingConfirmedEvent(this.id));
  }
}
```

**Repository Interface Conventions:**
```typescript
// ✅ CORRECT: Interface trong Domain Layer
export interface IBookingRepository {
  save(booking: Booking): Promise<void>;
  findById(id: BookingId): Promise<Booking | null>;
  findByCustomerId(customerId: CustomerId): Promise<Booking[]>;
}
```

### 4.3. Application Layer Conventions

**Use Cases:**
- Orchestrate Domain Layer
- Coordinate multiple aggregates
- Transaction management
- DTO mapping

**Command Handler Conventions:**
```typescript
// ✅ CORRECT: Application Layer orchestrate Domain
@CommandHandler(CreateBookingCommand)
export class CreateBookingHandler {
  constructor(
    @Inject('IBookingRepository')
    private readonly bookingRepo: IBookingRepository,
    private readonly bookingFactory: BookingFactory,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: CreateBookingCommand): Promise<BookingDto> {
    // 1. Validate (sử dụng Domain Services)
    // 2. Create domain entity
    // 3. Persist (sử dụng Repository Interface)
    // 4. Publish domain events
    // 5. Return DTO
  }
}
```

### 4.4. Infrastructure Layer Conventions

**Repository Implementation:**
```typescript
// ✅ CORRECT: Infrastructure implement Domain interface
@Injectable()
export class BookingRepository implements IBookingRepository {
  constructor(
    @InjectRepository(BookingOrmEntity)
    private readonly bookingRepo: Repository<BookingOrmEntity>,
    private readonly mapper: BookingMapper,
  ) {}

  async save(booking: Booking): Promise<void> {
    const ormEntity = this.mapper.toOrmEntity(booking);
    await this.bookingRepo.save(ormEntity);
  }
}
```

**Dependency Injection:**
```typescript
// ✅ CORRECT: Module binding interface với implementation
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

### 4.5. Presentation Layer Conventions

**Controller Conventions:**
```typescript
// ✅ CORRECT: Presentation Layer gọi Application Layer
@Controller('bookings')
export class BookingController {
  constructor(
    private readonly createBookingHandler: CreateBookingHandler,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Body() dto: CreateBookingDto): Promise<BookingDto> {
    const command = new CreateBookingCommand({
      customerId: dto.customerId,
      // ... map DTO to Command
    });
    return await this.createBookingHandler.execute(command);
  }
}
```

---

## 5. DDD Conventions

### 5.1. Aggregate Root Conventions

**Naming:**
- Aggregate Root class: `PascalCase` (ví dụ: `Booking`, `User`, `Accommodation`)
- Aggregate Root phải có identity duy nhất
- Aggregate Root quản lý lifecycle của entities bên trong

**Structure:**
```typescript
export class Booking extends AggregateRoot {
  private constructor(
    private readonly id: BookingId,
    private status: BookingStatus,
    // ... other properties
  ) {}

  static create(props: CreateBookingProps): Booking {
    // Business rules validation
    return new Booking(/* ... */);
  }

  confirm(): void {
    // Business logic
    this.raiseEvent(new BookingConfirmedEvent(this.id));
  }

  getDomainEvents(): DomainEvent[] {
    return this.domainEvents;
  }

  clearEvents(): void {
    this.domainEvents = [];
  }
}
```

### 5.2. Entity Conventions

**Entities trong Aggregate:**
- Entities không có identity riêng (chỉ Aggregate Root có)
- Entities được quản lý bởi Aggregate Root
- Naming: `PascalCase` (ví dụ: `BookingService`, `BookingGuest`)

### 5.3. Value Object Conventions

**Naming:**
- `PascalCase` (ví dụ: `Email`, `Money`, `DateRange`)
- Immutable
- Self-contained validation

**Structure:**
```typescript
export class Email {
  private constructor(private readonly value: string) {
    if (!this.isValid(value)) {
      throw new InvalidEmailError();
    }
  }

  static from(value: string): Email {
    return new Email(value);
  }

  getValue(): string {
    return this.value;
  }

  private isValid(value: string): boolean {
    // Validation logic
  }
}
```

### 5.4. Repository Interface Conventions

**Naming:**
- Interface: `I{Entity}Repository` (ví dụ: `IBookingRepository`)
- Methods: `camelCase` với động từ (ví dụ: `save()`, `findById()`, `findByCustomerId()`)
- Return types: Domain entities hoặc `null`

**Structure:**
```typescript
export interface IBookingRepository {
  save(booking: Booking): Promise<void>;
  findById(id: BookingId): Promise<Booking | null>;
  findByCustomerId(customerId: CustomerId): Promise<Booking[]>;
  findAvailableRooms(
    dateRange: DateRange,
    roomTypeId: RoomTypeId
  ): Promise<Room[]>;
}
```

### 5.5. Domain Event Conventions

**Naming:**
- `{Entity}{Action}Event` (ví dụ: `BookingCreatedEvent`, `PaymentSucceededEvent`)
- Implement `DomainEvent` interface
- Include `aggregateId` và `occurredAt`

**Structure:**
```typescript
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

### 5.6. Domain Service Conventions

**Naming:**
- `{Purpose}Service` (ví dụ: `BookingAvailabilityService`, `PriceCalculationService`)
- Pure business logic, không phụ thuộc infrastructure
- Static methods hoặc injectable services

**Structure:**
```typescript
@Injectable()
export class BookingAvailabilityService {
  async checkAvailability(
    roomId: RoomId,
    dateRange: DateRange,
  ): Promise<boolean> {
    // Business logic
  }
}
```

---

## 6. API Design Conventions

### 6.1. RESTful API Conventions

**URL Structure:**
- Resource-based URLs
- Plural nouns cho collections
- Versioning: `/api/v1/`

**Examples:**
```
GET    /api/v1/accommodations
GET    /api/v1/accommodations/{id}
POST   /api/v1/bookings
GET    /api/v1/bookings/{id}
PATCH  /api/v1/bookings/{id}/cancel
DELETE /api/v1/bookings/{id}
```

**HTTP Verbs:**
- `GET`: Read operations
- `POST`: Create operations
- `PUT`: Full update operations
- `PATCH`: Partial update operations
- `DELETE`: Delete operations

**Status Codes:**
- `200 OK`: Success
- `201 Created`: Resource created
- `204 No Content`: Success, no content
- `400 Bad Request`: Invalid request
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: Authorization failed
- `404 Not Found`: Resource not found
- `409 Conflict`: Resource conflict
- `422 Unprocessable Entity`: Validation error
- `500 Internal Server Error`: Server error

### 6.2. Request/Response Conventions

**Request DTOs:**
- Naming: `{Action}{Entity}Dto` (ví dụ: `CreateBookingDto`, `UpdateUserDto`)
- Validation với `class-validator`
- Clear property names

**Response DTOs:**
- Naming: `{Entity}Dto` hoặc `{Entity}ResponseDto` (ví dụ: `BookingDto`, `UserResponseDto`)
- Consistent structure
- Include only necessary fields

**Examples:**
```typescript
// Request DTO
export class CreateBookingDto {
  @IsUUID()
  customerId: string;

  @IsUUID()
  roomId: string;

  @IsDateString()
  checkInDate: string;

  @IsDateString()
  checkOutDate: string;

  @IsInt()
  @Min(1)
  numberOfGuests: number;
}

// Response DTO
export class BookingDto {
  id: string;
  bookingCode: string;
  status: string;
  totalAmount: number;
  checkInDate: string;
  checkOutDate: string;
  createdAt: string;
}
```

### 6.3. Error Response Conventions

**Error Response Structure:**
```typescript
{
  "statusCode": 400,
  "message": "Validation failed",
  "errors": [
    {
      "field": "checkInDate",
      "message": "Check-in date must be in the future"
    }
  ],
  "timestamp": "2024-01-01T00:00:00Z",
  "path": "/api/v1/bookings"
}
```

### 6.4. Swagger/OpenAPI Documentation Conventions

**Swagger Configuration:**
- Swagger UI available at `/api/docs`
- JWT Bearer Authentication configured
- Tags for grouping endpoints
- Version and description configured

**Controller Decorators:**
- **`@ApiTags('tag-name')`**: Group endpoints by feature/resource
- **`@ApiOperation({ summary: '...' })`**: Describe endpoint purpose
- **`@ApiResponse({ status, description, type })`**: Document response schemas
- **`@ApiBearerAuth('JWT-auth')`**: Mark endpoints requiring authentication
- **`@ApiBody({ type: DtoClass })`**: Document request body schema

**DTO Decorators:**
- **`@ApiProperty({ description, example, ... })`**: Document required properties
- **`@ApiPropertyOptional({ description, example, ... })`**: Document optional properties
- Include descriptions, examples, and validation constraints

**Examples:**

**Controller:**
```typescript
@ApiTags('customers')
@Controller('v1/customers')
export class CustomersController {
  @Post('register')
  @Public()
  @ApiOperation({ summary: 'Register a new customer account' })
  @ApiBody({ type: RegisterCustomerDto })
  @ApiResponse({
    status: 201,
    description: 'Customer successfully registered',
    type: CustomerResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request - validation failed' })
  async register(@Body() dto: RegisterCustomerDto): Promise<CustomerResponseDto> {
    // ...
  }

  @Get('me')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get current customer profile' })
  @ApiResponse({
    status: 200,
    description: 'Returns customer profile',
    type: CustomerResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async me(@Request() req: any): Promise<CustomerResponseDto> {
    // ...
  }
}
```

**Request DTO:**
```typescript
export class RegisterCustomerDto {
  @ApiProperty({
    description: 'Customer email address',
    example: 'customer@example.com',
  })
  @IsEmail()
  email!: string;

  @ApiProperty({
    description: 'Customer password (minimum 8 characters)',
    example: 'SecurePassword123!',
    minLength: 8,
  })
  @IsString()
  @MinLength(8)
  password!: string;

  @ApiPropertyOptional({
    description: 'Customer phone number',
    example: '+1234567890',
    pattern: '^[0-9+\\-()\\s]{6,20}$',
  })
  @IsOptional()
  @Matches(/^[0-9+\-()\s]{6,20}$/)
  phone?: string;
}
```

**Response DTO:**
```typescript
export class CustomerResponseDto {
  @ApiProperty({ 
    description: 'Customer unique identifier', 
    example: '123e4567-e89b-12d3-a456-426614174000' 
  })
  id!: string;

  @ApiProperty({ 
    description: 'Customer email address', 
    example: 'customer@example.com' 
  })
  email!: string;

  @ApiPropertyOptional({ 
    description: 'Customer phone number', 
    example: '+1234567890', 
    nullable: true 
  })
  phone!: string | null;

  @ApiProperty({ 
    description: 'Account creation timestamp', 
    example: '2024-01-01T00:00:00.000Z' 
  })
  createdAt!: string;
}
```

**Best Practices:**
- Always add `@ApiTags` to controllers for grouping
- Document all endpoints with `@ApiOperation`
- Include `@ApiResponse` for all possible status codes
- Use `@ApiBearerAuth('JWT-auth')` for protected endpoints
- Add `@ApiProperty` to all DTO properties with descriptions and examples
- Use `@ApiPropertyOptional` for optional fields
- Include validation constraints in `@ApiProperty` (minLength, maxLength, pattern, etc.)
- Use meaningful examples that reflect real-world usage
- Document error responses (400, 401, 403, 404, 500, etc.)

---

## 7. Database Conventions

### 7.1. Table Naming

- **Plural form, snake_case** (ví dụ: `users`, `bookings`, `accommodations`)
- Consistent với Aggregate Root names

### 7.2. Column Naming

- **snake_case** (ví dụ: `user_id`, `booking_code`, `check_in_date`)
- **Foreign keys:** `{referenced_table}_id`
- **Timestamps:** `created_at`, `updated_at`, `deleted_at`
- **Status fields:** `status`

### 7.3. TypeORM Entity Conventions

**Naming:**
- ORM Entity: `{Name}OrmEntity` (ví dụ: `BookingOrmEntity`, `UserOrmEntity`)
- Table name: Plural, snake_case
- Column names: snake_case

**Structure:**
```typescript
@Entity('bookings')
export class BookingOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'booking_code', unique: true })
  bookingCode: string;

  @Column({ name: 'customer_id' })
  customerId: string;

  @Column({ name: 'status' })
  status: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
```

### 7.4. Migration Conventions

**Naming:**
- `{timestamp}_{description}.ts` (ví dụ: `1234567890_create_bookings_table.ts`)
- Descriptive names
- Up and down methods

---

## 8. Security Conventions

### 8.1. Authentication

- JWT tokens cho stateless authentication
- Refresh tokens cho long-lived sessions
- Token expiration: 15 minutes (access), 7 days (refresh)

### 8.2. Authorization

- RBAC (Role-Based Access Control)
- Guards: `@UseGuards(JwtAuthGuard, RolesGuard)`
- Decorators: `@Roles('admin', 'manager')`, `@Permissions('manage_booking')`

**Examples:**
```typescript
@Controller('bookings')
@UseGuards(JwtAuthGuard, RolesGuard)
export class BookingController {
  @Post()
  @Roles('admin', 'manager')
  async create(@Body() dto: CreateBookingDto) {
    // ...
  }

  @Get(':id')
  @Permissions('view_booking')
  async getById(@Param('id') id: string) {
    // ...
  }
}
```

### 8.3. Data Security

- **Passwords:** Hash với bcrypt/argon2
- **Payment data:** Tokenization, không lưu full card numbers
- **Sensitive data:** Encryption at rest và in transit
- **Input validation:** Validate tất cả inputs

---

## 9. Testing Conventions

### 9.1. Test File Naming

- Unit tests: `{name}.spec.ts` (ví dụ: `booking.spec.ts`)
- Integration tests: `{name}.integration.spec.ts`
- E2E tests: `{name}.e2e-spec.ts`

### 9.2. Test Structure

**AAA Pattern (Arrange-Act-Assert):**
```typescript
describe('Booking', () => {
  describe('create', () => {
    it('should create booking with valid data', () => {
      // Arrange
      const props = createValidBookingProps();

      // Act
      const booking = Booking.create(props);

      // Assert
      expect(booking).toBeDefined();
      expect(booking.getStatus()).toBe(BookingStatus.PENDING_PAYMENT);
    });
  });
});
```

### 9.3. Mocking Conventions

- Mock interfaces, không mock concrete classes
- Use dependency injection để dễ mock
- Mock external services (payment gateway, email service)

---

## 10. Documentation Conventions

### 10.1. Code Comments

**JSDoc cho public APIs:**
```typescript
/**
 * Creates a new booking with the provided information.
 *
 * @param props - Booking creation properties
 * @returns A new Booking instance
 * @throws {InvalidDateRangeError} If date range is invalid
 * @throws {RoomNotAvailableError} If room is not available
 */
static create(props: CreateBookingProps): Booking {
  // Implementation
}
```

**Inline Comments:**
- Chỉ comment khi logic phức tạp
- Giải thích "why", không phải "what"
- Comment bằng tiếng Anh

### 10.2. README Conventions

- Project overview
- Setup instructions
- Architecture overview
- API documentation links
- Development guidelines

---

## 11. Git & Version Control Conventions

### 11.1. Branch Naming

- `main` hoặc `master`: Production branch
- `develop`: Development branch
- `feature/{feature-name}`: Feature branches
- `bugfix/{bug-name}`: Bug fix branches
- `hotfix/{issue-name}`: Hotfix branches

**Examples:**
```
feature/booking-management
bugfix/payment-gateway-error
hotfix/security-vulnerability
```

### 11.2. Commit Message Conventions

**Format:**
```
{type}({scope}): {subject}

{body}

{footer}
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Test changes
- `chore`: Build/tool changes

**Examples:**
```
feat(booking): add booking cancellation feature

fix(payment): resolve payment gateway timeout issue

docs(api): update API documentation
```

### 11.3. Pull Request Conventions

- Clear title và description
- Link to related issues
- Code review required
- All tests passing
- Documentation updated

---

## 12. TypeScript Conventions

### 12.1. Type Safety

- **Strict mode enabled**
- **Explicit types** cho functions và variables
- **Avoid `any`** - sử dụng `unknown` nếu cần
- **Import type an toàn:** Khi interface/type xuất hiện trong chữ ký có decorator (ví dụ constructor sử dụng `@Inject()`), luôn import bằng `import type` (hoặc namespace import) để tương thích với `isolatedModules` + `emitDecoratorMetadata`.
- **Use interfaces** cho object shapes
- **Use type aliases** cho complex types

**Examples:**
```typescript
// ✅ CORRECT
function calculatePrice(room: Room, dateRange: DateRange): Money {
  // ...
}

// ❌ WRONG
function calculatePrice(room: any, dateRange: any): any {
  // ...
}
```

### 12.2. Null Safety

- **Use `null` hoặc `undefined`** một cách nhất quán
- **Optional chaining:** `booking?.customerId`
- **Nullish coalescing:** `price ?? 0`

### 12.3. Async/Await

- **Prefer async/await** over Promises
- **Error handling:** Try-catch blocks
- **Parallel execution:** `Promise.all()` khi cần

**Examples:**
```typescript
// ✅ CORRECT
async function getBooking(id: BookingId): Promise<Booking | null> {
  try {
    return await this.bookingRepo.findById(id);
  } catch (error) {
    this.logger.error('Failed to get booking', error);
    throw new BookingNotFoundError();
  }
}

// ✅ CORRECT: Parallel execution
const [booking, customer] = await Promise.all([
  this.bookingRepo.findById(bookingId),
  this.customerRepo.findById(customerId),
]);
```

---

## 13. Error Handling Conventions

### 13.1. Domain Errors

**Naming:**
- `{Purpose}Error` (ví dụ: `RoomNotFoundError`, `InvalidBookingStatusError`)
- Extend từ base `DomainError`

**Structure:**
```typescript
export class RoomNotFoundError extends DomainError {
  constructor(roomId: RoomId) {
    super(`Room with id ${roomId.getValue()} not found`);
    this.name = 'RoomNotFoundError';
  }
}
```

### 13.2. Exception Handling

- **Use try-catch** cho async operations
- **Log errors** với context
- **Throw domain errors** từ domain layer
- **Map to HTTP errors** trong presentation layer

**Example:**
```typescript
@Controller('bookings')
export class BookingController {
  @Post()
  async create(@Body() dto: CreateBookingDto): Promise<BookingDto> {
    try {
      const command = new CreateBookingCommand(dto);
      return await this.createBookingHandler.execute(command);
    } catch (error) {
      if (error instanceof RoomNotFoundError) {
        throw new NotFoundException(error.message);
      }
      if (error instanceof InvalidDateRangeError) {
        throw new BadRequestException(error.message);
      }
      throw error;
    }
  }
}
```

---

## 14. Logging Conventions

### 14.1. Log Levels

- **DEBUG:** Detailed information for debugging
- **INFO:** General information
- **WARN:** Warning messages
- **ERROR:** Error messages
- **FATAL:** Critical errors

### 14.2. Log Format

**Structured Logging:**
```typescript
this.logger.info('Booking created', {
  bookingId: booking.getId().getValue(),
  customerId: booking.getCustomerId().getValue(),
  totalAmount: booking.getTotalAmount().getValue(),
});
```

**Context:**
- Include request ID
- Include user ID (nếu có)
- Include relevant entity IDs

---

## 15. Performance Conventions

### 15.1. Database Queries

- **Avoid N+1 queries:** Use eager loading hoặc batch loading
- **Use indexes:** Đảm bảo queries sử dụng indexes
- **Pagination:** Luôn paginate cho list queries
- **Connection pooling:** Sử dụng connection pooling

### 15.2. Caching

- **Cache keys:** Consistent naming (ví dụ: `booking:{id}`, `room:{id}:availability`)
- **TTL:** Set appropriate TTL
- **Invalidation:** Invalidate cache khi data thay đổi

### 15.3. Async Processing

- **Background jobs:** Sử dụng cho heavy operations
- **Event-driven:** Sử dụng domain events cho async processing
- **Queue:** Sử dụng Kafka cho message queue

---

## 16. Code Review Checklist

### 16.1. Code Quality

- [ ] Code follows naming conventions
- [ ] Code follows Clean Architecture principles
- [ ] Code follows DDD conventions
- [ ] No hardcoded values (use constants/config)
- [ ] Error handling implemented
- [ ] Logging added where needed

### 16.2. Testing

- [ ] Unit tests written
- [ ] Integration tests written (nếu cần)
- [ ] All tests passing
- [ ] Test coverage adequate

### 16.3. Documentation

- [ ] JSDoc comments for public APIs
- [ ] README updated (nếu cần)
- [ ] API documentation updated (nếu cần)

### 16.4. Security

- [ ] Input validation implemented
- [ ] Authorization checks in place
- [ ] Sensitive data handled securely
- [ ] No security vulnerabilities

---

## 17. Best Practices Summary

### 17.1. General Principles

1. **SOLID Principles:** Tuân thủ các nguyên tắc SOLID
2. **DRY (Don't Repeat Yourself):** Tránh duplicate code
3. **KISS (Keep It Simple, Stupid):** Giữ code đơn giản
4. **YAGNI (You Aren't Gonna Need It):** Không implement features chưa cần
5. **Clean Code:** Code dễ đọc, dễ hiểu, dễ maintain

### 17.2. Architecture Principles

1. **Clean Architecture:** Tuân thủ dependency rule
2. **DDD:** Tuân thủ DDD principles và conventions
3. **CQRS:** Tách biệt read và write operations
4. **Event-Driven:** Sử dụng domain events cho loose coupling
5. **Dependency Injection:** Sử dụng DI cho testability

### 17.3. Development Principles

1. **Test-Driven Development (TDD):** Viết tests trước khi code (nếu có thể)
2. **Code Reviews:** Tất cả code phải được review
3. **Continuous Integration:** CI/CD pipeline
4. **Documentation:** Document public APIs và architecture decisions
5. **Monitoring:** Monitor application performance và errors

---

## 18. Design Patterns

Hệ thống sử dụng các design patterns phù hợp với Clean Architecture và DDD để đảm bảo code dễ maintain, test và mở rộng.

**Xem chi tiết:** [05_design_parttern.md](./05_design_parttern.md)

**Tóm tắt các patterns được sử dụng:**
- **Repository Pattern:** Abstraction cho data access
- **Factory Pattern:** Tạo Aggregates phức tạp
- **Strategy Pattern:** Dynamic pricing, payment methods
- **Specification Pattern:** Encapsulate business rules
- **Unit of Work Pattern:** Quản lý transactions
- **Saga Pattern:** Long-running distributed transactions
- **Observer Pattern (Domain Events):** Loose coupling giữa aggregates
- **Adapter Pattern:** Adapt external services
- **Decorator Pattern:** Cross-cutting concerns
- **Mapper Pattern:** Data transformation
- **CQRS Pattern:** Tách biệt Read và Write operations
- **Value Object Pattern:** Immutable values với validation

---

## 19. Lưu ý

- **Consistency:** Nhất quán trong toàn bộ dự án
- **Evolution:** Conventions có thể thay đổi dựa trên feedback
- **Team Alignment:** Tất cả team members phải tuân thủ conventions
- **Tooling:** Sử dụng ESLint, Prettier để enforce conventions
- **Pattern Selection:** Chọn pattern phù hợp với use case, không over-engineer

---

**Tài liệu này sẽ được cập nhật thường xuyên dựa trên feedback và best practices mới.**

