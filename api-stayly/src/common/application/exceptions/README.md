# Application Layer Exceptions

Application layer có thể throw cả **Domain Errors** và **HTTP Exceptions** tùy theo context. Utilities này giúp throw HTTP exceptions một cách consistent và type-safe.

## Quy tắc

1. **Domain Errors**: Throw khi business logic violation xảy ra trong domain layer
2. **HTTP Exceptions**: Throw khi:
   - Entity không tồn tại trong repository
   - Input validation failed ở application layer
   - Cần trả về HTTP status code cụ thể

## Utilities

### Throw Functions

#### `throwEntityNotFound(entityName, identifier?)`
Throws `NotFoundException` (404) khi entity không tồn tại.

```typescript
// Example
const role = await this.roleRepository.findById(roleId);
if (!role) {
  throwEntityNotFound('Role', roleId.getValue());
}
```

#### `throwInvalidInput(message, field?)`
Throws `BadRequestException` (400) khi input không hợp lệ.

```typescript
// Example
if (!command.displayName?.trim()) {
  throwInvalidInput('Display name is required', 'displayName');
}
```

#### `throwConflict(message, conflictType?)`
Throws `ConflictException` (409) khi có conflict.

```typescript
// Example
const existing = await this.userRepository.findByEmail(email);
if (existing) {
  throwConflict('User with this email already exists', 'DUPLICATE_EMAIL');
}
```

#### `throwUnauthorized(message?, reason?)`
Throws `UnauthorizedException` (401) khi authentication failed.

```typescript
// Example
if (!user) {
  throwUnauthorized('Invalid credentials');
}
```

#### `throwForbidden(message?, requiredPermission?, requiredRole?)`
Throws `ForbiddenException` (403) khi thiếu permissions.

```typescript
// Example
if (!user.hasPermission('booking:create')) {
  throwForbidden('Insufficient permissions', 'booking:create');
}
```

#### `throwInvalidOperation(message, operation?, reason?)`
Throws `UnprocessableEntityException` (422) khi operation không thể thực hiện.

```typescript
// Example
if (booking.status !== BookingStatus.PENDING) {
  throwInvalidOperation(
    'Cannot cancel booking',
    'cancel',
    'Booking is not in pending status',
  );
}
```

### Assertion Functions

#### `ensureEntityExists(entity, entityName, identifier?)`
Validates entity exists, throws `NotFoundException` nếu không.

```typescript
// Example - Returns entity if exists, throws if not
const role = ensureEntityExists(
  await this.roleRepository.findById(roleId),
  'Role',
  roleId.getValue(),
);
// role is guaranteed to be non-null here
```

#### `ensureCondition(condition, message, field?)`
Validates condition, throws `BadRequestException` nếu false.

```typescript
// Example
ensureCondition(
  command.displayName?.trim().length > 0,
  'Display name cannot be empty',
  'displayName',
);
```

#### `ensureNoConflict(condition, message, conflictType?)`
Validates no conflict, throws `ConflictException` nếu có conflict.

```typescript
// Example
ensureNoConflict(
  !existingUser,
  'User with this email already exists',
  'DUPLICATE_EMAIL',
);
```

## Usage Examples

### Command Handler

```typescript
import { ensureEntityExists, throwConflict } from '@/common/application/exceptions';
import { NotFoundError } from '@/common/domain/errors';

@CommandHandler(CreateBookingCommand)
export class CreateBookingHandler {
  async execute(command: CreateBookingCommand): Promise<BookingDto> {
    // Option 1: Use utility function
    const room = ensureEntityExists(
      await this.roomRepository.findById(command.roomId),
      'Room',
      command.roomId,
    );

    // Option 2: Manual check
    if (!room.isAvailable(command.dateRange)) {
      throwConflict('Room is not available for selected dates');
    }

    // Option 3: Let domain layer throw domain errors
    const booking = Booking.create({ /* ... */ }); // May throw InvalidStateError
    await this.bookingRepository.save(booking);
    
    return BookingDto.fromDomain(booking);
  }
}
```

### Query Handler

```typescript
import { ensureEntityExists } from '@/common/application/exceptions';

@QueryHandler(GetRoleQuery)
export class GetRoleHandler {
  async execute(query: GetRoleQuery): Promise<RoleDto> {
    const roleId = RoleId.create(query.roleId);
    
    // Use assertion function for cleaner code
    const role = ensureEntityExists(
      await this.roleRepository.findById(roleId),
      'Role',
      roleId.getValue(),
    );

    return RoleDto.fromDomain(role);
  }
}
```

### Service

```typescript
import { throwConflict, ensureCondition } from '@/common/application/exceptions';

@Injectable()
export class UserRoleLinkService {
  async replaceUserRoles(userId: string, roleIds: string[]): Promise<void> {
    // Validate input
    ensureCondition(roleIds.length > 0, 'At least one role is required');

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throwEntityNotFound('User', userId);
    }

    const roles = await this.roleRepository.find({
      where: { id: In(roleIds) },
    });

    // Check for missing roles
    if (roles.length !== roleIds.length) {
      throwConflict('One or more roles are missing from catalog');
    }

    // ... rest of logic
  }
}
```

## Best Practices

1. **Use assertion functions** (`ensureEntityExists`, `ensureCondition`) để code ngắn gọn hơn
2. **Use throw functions** khi cần custom message hoặc metadata
3. **Let domain layer throw domain errors** cho business logic violations
4. **Use HTTP exceptions** cho application-level concerns (not found, validation, etc.)
5. **Be consistent** - sử dụng utilities này thay vì throw generic `Error`

## Migration Guide

Thay thế các `throw new Error()` bằng utilities phù hợp:

```typescript
// ❌ Before
if (!user) {
  throw new Error('User not found');
}

// ✅ After
if (!user) {
  throwEntityNotFound('User', userId);
}

// ✅ Or even better
const user = ensureEntityExists(
  await this.userRepository.findById(userId),
  'User',
  userId,
);
```

