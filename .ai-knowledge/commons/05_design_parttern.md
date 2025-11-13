# Design Patterns - Homestay & Hotel Booking System

## 1. Tổng quan

Hệ thống sử dụng các design patterns phù hợp với Clean Architecture và DDD để đảm bảo code dễ maintain, test và mở rộng.

**Nguyên tắc:**
- Chọn pattern phù hợp với use case
- Không over-engineer
- Tuân thủ Clean Architecture principles
- Tuân thủ DDD principles

---

## 2. Repository Pattern

**Mục đích:** Abstraction cho data access, dễ test và maintain

**Implementation:**
- **Domain Layer:** Định nghĩa interface `I{Entity}Repository`
- **Infrastructure Layer:** Implement interface với TypeORM

**Conventions:**
- Interface trong `domain/repositories/`
- Implementation trong `infrastructure/persistence/repositories/`
- Sử dụng Mapper để convert Domain Entity ↔ ORM Entity

**Example:**
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
    private readonly mapper: BookingMapper,
  ) {}

  async save(booking: Booking): Promise<void> {
    const ormEntity = this.mapper.toOrmEntity(booking);
    await this.bookingRepo.save(ormEntity);
  }

  async findById(id: BookingId): Promise<Booking | null> {
    const ormEntity = await this.bookingRepo.findOne({
      where: { id: id.getValue() },
    });
    return ormEntity ? this.mapper.toDomain(ormEntity) : null;
  }
}
```

**When to use:**
- Tất cả data access operations
- Khi cần abstract database implementation
- Khi cần test domain logic mà không cần database

---

## 3. Factory Pattern

**Mục đích:** Tạo complex objects (Aggregates) với validation và business rules

**Implementation:**
- **Domain Service:** `{Entity}Factory` trong `domain/services/`
- Validate business rules trước khi tạo
- Raise domain events sau khi tạo

**Conventions:**
- Factory class: `{Entity}Factory`
- Method: `create(props: Create{Entity}Props): Promise<{Entity}>`
- Validate business rules trong factory

**Example:**
```typescript
@Injectable()
export class BookingFactory {
  constructor(
    private readonly roomAvailabilityService: RoomAvailabilityService,
    private readonly eventBus: EventBus,
  ) {}

  async create(props: CreateBookingProps): Promise<Booking> {
    // 1. Validate business rules
    await this.roomAvailabilityService.checkAvailability(
      props.roomId,
      props.dateRange,
    );

    // 2. Create Booking aggregate
    const booking = Booking.create({
      customerId: props.customerId,
      roomId: props.roomId,
      dateRange: props.dateRange,
      guestInfo: props.guestInfo,
    });

    // 3. Raise domain events
    booking.getDomainEvents().forEach((event) => {
      this.eventBus.publish(event);
    });

    return booking;
  }
}
```

**When to use:**
- Tạo Aggregates phức tạp
- Khi cần validate nhiều business rules
- Khi cần coordinate nhiều entities

---

## 4. Strategy Pattern

**Mục đích:** Encapsulate algorithms có thể thay đổi (pricing strategies, payment methods)

**Implementation:**
- **Domain Layer:** Interface `{Purpose}Strategy`
- **Concrete Strategies:** Implementations trong `domain/services/`
- **Context:** Service sử dụng strategies

**Conventions:**
- Interface: `{Purpose}Strategy`
- Implementation: `{Type}{Purpose}Strategy` (ví dụ: `SeasonalPricingStrategy`)
- Inject strategies qua DI

**Example:**
```typescript
// Domain Layer - Strategy Interface
export interface PricingStrategy {
  calculatePrice(room: Room, dateRange: DateRange): Money;
  getPriority(): number; // Higher priority = applied first
}

// Concrete Strategies
@Injectable()
export class SeasonalPricingStrategy implements PricingStrategy {
  getPriority(): number {
    return 2; // Medium priority
  }

  calculatePrice(room: Room, dateRange: DateRange): Money {
    const season = this.determineSeason(dateRange);
    const multiplier = season === 'high' ? 1.5 : 0.8;
    return room.basePrice.multiply(multiplier);
  }
}

@Injectable()
export class WeeklyPricingStrategy implements PricingStrategy {
  getPriority(): number {
    return 3; // Higher priority
  }

  calculatePrice(room: Room, dateRange: DateRange): Money {
    const dayOfWeek = dateRange.getCheckInDate().getDay();
    const multiplier = dayOfWeek >= 5 ? 1.2 : 1.0; // Weekend pricing
    return room.basePrice.multiply(multiplier);
  }
}

// Context - Price Calculation Service
@Injectable()
export class PriceCalculationService {
  constructor(
    @Inject('PricingStrategy')
    private readonly strategies: PricingStrategy[],
  ) {}

  calculateFinalPrice(room: Room, dateRange: DateRange): Money {
    // Apply all strategies and get the highest price
    const prices = this.strategies
      .sort((a, b) => b.getPriority() - a.getPriority())
      .map((strategy) => strategy.calculatePrice(room, dateRange));
    
    return prices.reduce((max, price) => 
      price.amount > max.amount ? price : max
    );
  }
}
```

**When to use:**
- Dynamic pricing (seasonal, weekly, promotional)
- Multiple payment methods
- Different calculation algorithms
- When algorithms can be swapped at runtime

---

## 5. Specification Pattern

**Mục đích:** Encapsulate business rules thành reusable, composable specifications

**Implementation:**
- **Domain Layer:** Interface `Specification<T>` và concrete specifications
- **Composable:** Có thể combine nhiều specifications

**Conventions:**
- Interface: `Specification<T>`
- Implementation: `{Purpose}Specification` (ví dụ: `AvailableRoomSpecification`)
- Method: `isSatisfiedBy(candidate: T): boolean`

**Example:**
```typescript
// Domain Layer - Specification Interface
export interface Specification<T> {
  isSatisfiedBy(candidate: T): boolean;
  and(other: Specification<T>): Specification<T>;
  or(other: Specification<T>): Specification<T>;
  not(): Specification<T>;
}

// Concrete Specification
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

  and(other: Specification<Room>): Specification<Room> {
    return new AndSpecification(this, other);
  }

  or(other: Specification<Room>): Specification<Room> {
    return new OrSpecification(this, other);
  }

  not(): Specification<Room> {
    return new NotSpecification(this);
  }
}

// Composite Specifications
export class AndSpecification<T> implements Specification<T> {
  constructor(
    private readonly left: Specification<T>,
    private readonly right: Specification<T>,
  ) {}

  isSatisfiedBy(candidate: T): boolean {
    return (
      this.left.isSatisfiedBy(candidate) &&
      this.right.isSatisfiedBy(candidate)
    );
  }
}

// Usage
const spec = new AvailableRoomSpecification(dateRange, 2)
  .and(new RoomTypeSpecification('deluxe'))
  .and(new PriceRangeSpecification(minPrice, maxPrice));

const availableRooms = rooms.filter((room) => spec.isSatisfiedBy(room));
```

**When to use:**
- Complex business rules
- Reusable query conditions
- Composable filters
- Domain-driven queries

---

## 6. Unit of Work Pattern

**Mục đích:** Quản lý transactions, đảm bảo consistency khi thao tác nhiều aggregates

**Implementation:**
- Sử dụng TypeORM `DataSource.transaction()`
- Wrap multiple repository operations trong transaction

**Conventions:**
- Sử dụng trong Application Layer (Command Handlers)
- Transaction boundary: Một use case
- Rollback tự động khi có lỗi

**Example:**
```typescript
@CommandHandler(CreateBookingCommand)
export class CreateBookingHandler {
  constructor(
    private readonly dataSource: DataSource,
    private readonly bookingRepo: IBookingRepository,
    private readonly paymentRepo: IPaymentRepository,
    private readonly roomRepo: IRoomRepository,
  ) {}

  async execute(command: CreateBookingCommand): Promise<BookingDto> {
    return await this.dataSource.transaction(async (manager) => {
      // 1. Check room availability
      const room = await this.roomRepo.findById(command.roomId, manager);
      if (!room || !room.isAvailable(command.dateRange)) {
        throw new RoomNotAvailableError();
      }

      // 2. Create booking
      const booking = Booking.create({ /* ... */ });
      await this.bookingRepo.save(booking, manager);

      // 3. Create payment
      const payment = Payment.create({ bookingId: booking.getId() });
      await this.paymentRepo.save(payment, manager);

      // 4. Block room
      room.block(command.dateRange);
      await this.roomRepo.save(room, manager);

      return BookingMapper.toDto(booking);
    });
  }
}
```

**When to use:**
- Khi cần update nhiều aggregates trong một transaction
- Khi cần đảm bảo ACID properties
- Khi cần rollback toàn bộ nếu một operation fails

---

## 7. Saga Pattern

**Mục đích:** Quản lý long-running distributed transactions (Booking → Payment → Revenue)

**Implementation:**
- **Application Layer:** Saga class với event handlers
- **Event-driven:** Sử dụng domain events để coordinate
- **Compensation:** Rollback operations nếu có lỗi

**Conventions:**
- Saga class: `{Process}Saga` (ví dụ: `BookingSaga`)
- Methods: `handle{Event}(event: {Event}): Promise<void>`
- Decorator: `@Saga()` cho saga methods

**Example:**
```typescript
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
    // Wait for PaymentSucceededEvent
  }

  @Saga()
  async handlePaymentSucceeded(event: PaymentSucceededEvent) {
    // Step 2: Create Revenue record
    await this.revenueService.create({
      bookingId: event.bookingId,
      amount: event.amount,
    });

    // Step 3: Confirm Booking
    await this.bookingService.confirm(event.bookingId);
  }

  @Saga()
  async handlePaymentFailed(event: PaymentFailedEvent) {
    // Compensation: Cancel Booking
    await this.bookingService.cancel(event.bookingId);
  }
}
```

**When to use:**
- Long-running business processes
- Distributed transactions across aggregates
- When need compensation logic
- Event-driven workflows

---

## 8. Observer Pattern (Domain Events)

**Mục đích:** Loose coupling giữa aggregates, event-driven communication

**Implementation:**
- **Domain Layer:** Aggregate raises events
- **Application Layer:** Event handlers process events
- **Infrastructure:** Kafka publishes/consumes events

**Conventions:**
- Event class: `{Entity}{Action}Event` (ví dụ: `BookingCreatedEvent`)
- Event handler: `{Event}Handler`
- Decorator: `@EventsHandler({Event})`

**Example:**
```typescript
// Domain Layer - Aggregate raises event
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
    private readonly eventPublisher: IEventPublisher,
  ) {}

  async handle(event: BookingConfirmedEvent) {
    // 1. Send notification
    await this.notificationService.sendBookingConfirmation(event.bookingId);

    // 2. Create revenue record
    await this.revenueService.createFromBooking(event.bookingId);

    // 3. Publish to Kafka (if needed)
    await this.eventPublisher.publish(event);
  }
}
```

**When to use:**
- Communication giữa aggregates
- Async processing (notifications, reports)
- Event sourcing
- Decoupling bounded contexts

---

## 9. Adapter Pattern (Port/Adapter Pattern)

**Mục đích:** 
- Adapt external services (payment gateways, email services) cho domain interfaces
- **Cross-module communication:** Decouple modules bằng Port/Adapter pattern

**Implementation:**

### 9.1. External Services Adapter

- **Domain/Application Layer:** Interface cho external service
- **Infrastructure Layer:** Adapter implement interface

**Conventions:**
- Interface: `I{Service}Adapter` hoặc `I{Service}Gateway`
- Implementation: `{Provider}{Service}Adapter` (ví dụ: `VNPayPaymentAdapter`)

### 9.2. Cross-Module Communication (Port/Adapter Pattern)

**Nguyên tắc:**
- **Port (Interface):** Định nghĩa trong `application/interfaces/` của module sở hữu dữ liệu
- **Adapter:** Implement trong `infrastructure/adapters/` của module cần dữ liệu
- **Application layer:** Chỉ phụ thuộc vào interface, không import từ module khác
- **Infrastructure layer:** Xử lý giao tiếp giữa các module

**Conventions:**
- Port interface: `I{Entity}{Purpose}Port` (ví dụ: `IUserAuthenticationPort`)
- Port token: `{ENTITY}_{PURPOSE}_PORT` (ví dụ: `USER_AUTHENTICATION_PORT`)
- Adapter: `{Entity}{Purpose}Adapter` (ví dụ: `UserAuthenticationAdapter`)
- Module interface: `I{Entity}{Purpose}Service` (trong module cần dữ liệu)

**Example - Cross-Module Communication:**
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
export const USER_AUTHENTICATION_SERVICE = 'USER_AUTHENTICATION_SERVICE';

// Auth Module - infrastructure/adapters/user-authentication.adapter.ts
@Injectable()
export class UserAuthenticationAdapter implements IUserAuthenticationService {
  constructor(
    @Inject(USER_AUTHENTICATION_PORT)
    private readonly userAuthPort: IUserAuthenticationPort,
  ) {}
  
  async findForAuthentication(email: Email): Promise<UserAuthenticationData | null> {
    return this.userAuthPort.findForAuthentication(email);
  }
}

// Auth Module - auth.module.ts
@Module({
  imports: [UserModule],
  providers: [
    { provide: USER_AUTHENTICATION_SERVICE, useClass: UserAuthenticationAdapter },
  ],
})
export class AuthModule {}

// Auth Module - application/commands/handlers/authenticate-user.handler.ts
@CommandHandler(AuthenticateUserCommand)
export class AuthenticateUserHandler {
  constructor(
    @Inject(USER_AUTHENTICATION_SERVICE)
    private readonly userAuthService: IUserAuthenticationService, // Only depends on interface
  ) {}
}
```

**Example:**
```typescript
// Domain/Application Layer - Interface
export interface IPaymentGateway {
  initiatePayment(request: PaymentRequest): Promise<PaymentResponse>;
  processWebhook(payload: unknown): Promise<WebhookResult>;
  refund(transactionId: string, amount: Money): Promise<RefundResult>;
}

// Infrastructure Layer - VNPay Adapter
@Injectable()
export class VNPayPaymentAdapter implements IPaymentGateway {
  constructor(
    private readonly vnpayClient: VNPayClient,
    private readonly config: PaymentConfig,
  ) {}

  async initiatePayment(request: PaymentRequest): Promise<PaymentResponse> {
    const vnpayRequest = this.mapToVNPayRequest(request);
    const vnpayResponse = await this.vnpayClient.createPayment(vnpayRequest);
    return this.mapFromVNPayResponse(vnpayResponse);
  }

  async processWebhook(payload: unknown): Promise<WebhookResult> {
    const vnpayWebhook = this.validateVNPayWebhook(payload);
    return {
      transactionId: vnpayWebhook.transactionId,
      status: this.mapStatus(vnpayWebhook.status),
      amount: Money.from(vnpayWebhook.amount, 'VND'),
    };
  }

  async refund(transactionId: string, amount: Money): Promise<RefundResult> {
    // Implementation
  }
}

// MoMo Adapter
@Injectable()
export class MoMoPaymentAdapter implements IPaymentGateway {
  // Similar implementation for MoMo
}
```

**When to use:**
- Integrate với external services
- Multiple providers cho cùng một service
- Abstract external API details
- Easy to swap implementations

---

## 10. Decorator Pattern

**Mục đích:** Thêm tính năng cross-cutting (logging, caching, validation) không ảnh hưởng core logic

**Implementation:**
- **NestJS Interceptors:** Implement `NestInterceptor`
- **Decorators:** `@UseInterceptors({Interceptor})`

**Conventions:**
- Interceptor class: `{Purpose}Interceptor`
- Method: `intercept(context, next): Promise<Observable>`

**Example:**
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
    const cacheKey = this.generateCacheKey(request);

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

// Logging Interceptor
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private readonly logger: Logger) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const startTime = Date.now();

    return next.handle().pipe(
      tap(() => {
        const duration = Date.now() - startTime;
        this.logger.log(`${request.method} ${request.url} - ${duration}ms`);
      }),
      catchError((error) => {
        this.logger.error(`Error: ${error.message}`);
        throw error;
      }),
    );
  }
}

// Usage
@Controller('bookings')
@UseInterceptors(LoggingInterceptor, CacheInterceptor)
export class BookingController {
  // ...
}
```

**When to use:**
- Cross-cutting concerns (logging, caching, validation)
- Performance optimization
- Request/response transformation
- Error handling

---

## 11. Mapper Pattern

**Mục đích:** Convert giữa Domain entities và DTOs/ORM entities

**Implementation:**
- **Mapper class:** `{Entity}Mapper` với static methods
- **Methods:** `toDto()`, `toDomain()`, `toOrmEntity()`

**Conventions:**
- Mapper class: `{Entity}Mapper`
- Static methods: `toDto()`, `toDomain()`, `toOrmEntity()`
- Location: `application/mappers/` hoặc `infrastructure/persistence/mappers/`

**Example:**
```typescript
@Injectable()
export class BookingMapper {
  static toDto(booking: Booking): BookingDto {
    return {
      id: booking.getId().getValue(),
      bookingCode: booking.getBookingCode().getValue(),
      status: booking.getStatus().getValue(),
      totalAmount: booking.getTotalAmount().getAmount(),
      checkInDate: booking.getDateRange().getCheckInDate().toISOString(),
      checkOutDate: booking.getDateRange().getCheckOutDate().toISOString(),
      createdAt: booking.getCreatedAt().toISOString(),
    };
  }

  static toDomain(ormEntity: BookingOrmEntity): Booking {
    return Booking.reconstitute({
      id: BookingId.from(ormEntity.id),
      bookingCode: BookingCode.from(ormEntity.bookingCode),
      status: BookingStatus.from(ormEntity.status),
      // ... map other fields
    });
  }

  static toOrmEntity(booking: Booking): BookingOrmEntity {
    const ormEntity = new BookingOrmEntity();
    ormEntity.id = booking.getId().getValue();
    ormEntity.bookingCode = booking.getBookingCode().getValue();
    ormEntity.status = booking.getStatus().getValue();
    // ... map other fields
    return ormEntity;
  }
}
```

**When to use:**
- Convert Domain entities ↔ DTOs
- Convert Domain entities ↔ ORM entities
- Data transformation
- Separation of concerns

---

## 12. CQRS Pattern (Command Query Responsibility Segregation)

**Mục đích:** Tách biệt Read và Write operations để tối ưu performance và scalability

**Implementation:**
- **Commands:** Write operations trong `application/commands/`
- **Queries:** Read operations trong `application/queries/`
- **Separate models:** Write model (Domain) và Read model (DTOs/Views)

**Conventions:**
- Command: `{Action}{Entity}Command`
- Command Handler: `{Action}{Entity}Handler`
- Query: `{Action}{Entity}Query`
- Query Handler: `{Action}{Entity}Handler`

**Example:**
```typescript
// Command - Write operation
export class CreateBookingCommand {
  constructor(
    public readonly customerId: string,
    public readonly roomId: string,
    public readonly checkInDate: Date,
    public readonly checkOutDate: Date,
  ) {}
}

@CommandHandler(CreateBookingCommand)
export class CreateBookingHandler {
  async execute(command: CreateBookingCommand): Promise<BookingDto> {
    // Write to database
    const booking = await this.bookingFactory.create(command);
    await this.bookingRepo.save(booking);
    return BookingMapper.toDto(booking);
  }
}

// Query - Read operation
export class SearchAccommodationsQuery {
  constructor(
    public readonly location: string,
    public readonly checkInDate: Date,
    public readonly checkOutDate: Date,
    public readonly numberOfGuests: number,
  ) {}
}

@QueryHandler(SearchAccommodationsQuery)
export class SearchAccommodationsHandler {
  async execute(query: SearchAccommodationsQuery): Promise<AccommodationDto[]> {
    // Read from read model or denormalized view
    return await this.searchService.search(query);
  }
}
```

**When to use:**
- Read-heavy applications
- Complex queries
- Need to scale read/write independently
- Different optimization strategies for read/write

---

## 13. Value Object Pattern

**Mục đích:** Represent immutable values với validation

**Implementation:**
- **Immutable:** Không thể thay đổi sau khi tạo
- **Self-contained:** Validation logic trong value object
- **No identity:** Được so sánh bằng value, không phải identity

**Conventions:**
- Class: `PascalCase` (ví dụ: `Email`, `Money`, `DateRange`)
- Factory method: `from()` hoặc `create()`
- Validation: Trong constructor hoặc factory method

**Example:**
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

  equals(other: Email): boolean {
    return this.value === other.value;
  }

  private isValid(value: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  }
}

export class Money {
  private constructor(
    private readonly amount: number,
    private readonly currency: string,
  ) {
    if (amount < 0) {
      throw new InvalidMoneyError('Amount cannot be negative');
    }
    if (!['VND', 'USD', 'EUR'].includes(currency)) {
      throw new InvalidMoneyError('Invalid currency');
    }
  }

  static from(amount: number, currency: string): Money {
    return new Money(amount, currency);
  }

  add(other: Money): Money {
    if (this.currency !== other.currency) {
      throw new CurrencyMismatchError();
    }
    return new Money(this.amount + other.amount, this.currency);
  }

  multiply(factor: number): Money {
    return new Money(this.amount * factor, this.currency);
  }

  getAmount(): number {
    return this.amount;
  }

  getCurrency(): string {
    return this.currency;
  }
}
```

**When to use:**
- Immutable values
- Values cần validation
- Values không có identity
- Domain concepts (Email, Money, Address, DateRange)

---

## 14. Tóm tắt các Design Patterns

| Pattern | Mục đích | Khi nào sử dụng |
|---------|----------|-----------------|
| **Repository** | Abstraction cho data access | Tất cả data access operations |
| **Factory** | Tạo Aggregates phức tạp | Tạo objects với nhiều business rules |
| **Strategy** | Encapsulate algorithms | Dynamic pricing, payment methods |
| **Specification** | Encapsulate business rules | Complex, composable business rules |
| **Unit of Work** | Quản lý transactions | Multiple aggregates trong transaction |
| **Saga** | Long-running transactions | Distributed transactions, compensation |
| **Observer (Events)** | Loose coupling | Communication giữa aggregates |
| **Adapter** | Adapt external services | Payment gateways, email services |
| **Decorator** | Cross-cutting concerns | Logging, caching, validation |
| **Mapper** | Data transformation | Domain ↔ DTO ↔ ORM conversion |
| **CQRS** | Tách Read/Write | Read-heavy, complex queries |
| **Value Object** | Immutable values | Email, Money, Address, DateRange |

---

## 15. Best Practices

### 15.1. Pattern Selection

- **Chọn pattern phù hợp:** Không over-engineer, chỉ dùng khi cần
- **Consistency:** Sử dụng pattern nhất quán trong toàn bộ dự án
- **Documentation:** Document lý do chọn pattern cho từng use case

### 15.2. Implementation Guidelines

- **Follow conventions:** Tuân thủ naming và structure conventions
- **Test patterns:** Viết tests cho pattern implementations
- **Refactor khi cần:** Không ngại refactor nếu pattern không phù hợp

### 15.3. Common Pitfalls

- **Over-engineering:** Sử dụng pattern không cần thiết
- **Inconsistent:** Không nhất quán trong cách implement
- **Tight coupling:** Pattern tạo tight coupling thay vì loose coupling

---

**Tài liệu này sẽ được cập nhật thường xuyên dựa trên feedback và best practices mới.**

