# Domain Errors

Domain errors represent business rule violations and should be thrown from the domain layer. They are framework-agnostic and can be mapped to HTTP exceptions in the presentation layer.

## Base Classes

### DomainError
Base abstract class for all domain errors. Provides:
- Error code for programmatic handling
- Metadata for additional context
- Timestamp of when error occurred
- JSON serialization support

### Specific Error Types

1. **NotFoundError** - Entity or resource not found (→ 404)
2. **InvalidInputError** - Input validation failed (→ 400)
3. **InvalidStateError** - Invalid state for operation (→ 400)
4. **ConflictError** - Resource conflict (→ 409)
5. **UnauthorizedError** - Authentication failed (→ 401)
6. **ForbiddenError** - Insufficient permissions (→ 403)
7. **InvalidOperationError** - Operation cannot be performed (→ 422)

## Usage Examples

### Domain Layer

```typescript
import { NotFoundError, InvalidStateError } from '@/common/domain/errors';

// In domain entity
export class Booking {
  confirm(): void {
    if (this.status !== BookingStatus.PENDING_PAYMENT) {
      throw new InvalidStateError(
        `Cannot confirm booking with status ${this.status}`,
        this.status,
        BookingStatus.PENDING_PAYMENT,
      );
    }
    this.status = BookingStatus.CONFIRMED;
  }
}

// In repository interface implementation
export class BookingRepository implements IBookingRepository {
  async findById(id: BookingId): Promise<Booking | null> {
    const booking = await this.ormRepo.findOne({ where: { id: id.getValue() } });
    if (!booking) {
      throw new NotFoundError('Booking', id.getValue());
    }
    return this.mapper.toDomain(booking);
  }
}
```

### Application Layer

```typescript
import { NotFoundException, ConflictException } from '@nestjs/common';
import { NotFoundError, ConflictError } from '@/common/domain/errors';

@CommandHandler(CreateBookingCommand)
export class CreateBookingHandler {
  async execute(command: CreateBookingCommand): Promise<BookingDto> {
    // Option 1: Throw HTTP exceptions directly
    const room = await this.roomRepository.findById(command.roomId);
    if (!room) {
      throw new NotFoundException('Room not found');
    }

    // Option 2: Let domain layer throw domain errors
    const booking = Booking.create({ /* ... */ }); // May throw InvalidStateError
    await this.bookingRepository.save(booking);
  }
}
```

### Presentation Layer

```typescript
import { Controller, Post, Body } from '@nestjs/common';
import { NotFoundError, InvalidInputError } from '@/common/domain/errors';
import { NotFoundException, BadRequestException } from '@nestjs/common';

@Controller('bookings')
export class BookingController {
  @Post()
  async create(@Body() dto: CreateBookingDto): Promise<BookingDto> {
    try {
      const command = new CreateBookingCommand(dto);
      return await this.createBookingHandler.execute(command);
    } catch (error) {
      // Map domain errors to HTTP exceptions
      if (error instanceof NotFoundError) {
        throw new NotFoundException(error.message);
      }
      if (error instanceof InvalidInputError) {
        throw new BadRequestException(error.message);
      }
      // Re-throw HTTP exceptions
      if (error instanceof HttpException) {
        throw error;
      }
      throw error;
    }
  }
}
```

## Automatic Mapping

The `AllExceptionsFilter` automatically maps domain errors to HTTP exceptions. You don't need to manually map them in controllers if you prefer:

```typescript
// Domain error will be automatically mapped by AllExceptionsFilter
@Controller('bookings')
export class BookingController {
  @Post()
  async create(@Body() dto: CreateBookingDto): Promise<BookingDto> {
    // Just throw domain errors - filter will handle mapping
    const command = new CreateBookingCommand(dto);
    return await this.createBookingHandler.execute(command);
  }
}
```

## Error Metadata

Domain errors support metadata for additional context:

```typescript
throw new ConflictError(
  'User with this email already exists',
  'DUPLICATE_EMAIL',
  email,
  {
    userId: existingUser.getId().getValue(),
    createdAt: existingUser.getCreatedAt(),
  },
);
```

## Best Practices

1. **Domain Layer**: Only throw domain errors, never HTTP exceptions
2. **Application Layer**: Can throw either domain errors or HTTP exceptions
3. **Presentation Layer**: Map domain errors to HTTP exceptions (or let filter handle it)
4. **Error Messages**: Use clear, descriptive messages with context
5. **Metadata**: Include relevant context in error metadata for logging


