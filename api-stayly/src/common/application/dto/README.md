# Common Pagination DTOs

Common pagination utilities that can be used across all modules.

## Components

### 1. `PaginationMetaDto`
Metadata for pagination response containing:
- `total`: Total number of items
- `perpage`: Number of items per page
- `total_page`: Total number of pages (calculated)
- `current_page`: Current page number

### 2. `PaginatedResponseDto<T>`
Generic paginated response DTO that can be used by any module:
```typescript
{
  data: T[],
  meta: PaginationMetaDto
}
```

### 3. `PaginationQueryDto`
Base query DTO for pagination that provides:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `normalize()`: Method to validate and normalize pagination params
- `getOffset()`: Method to calculate offset from page and limit

## Usage Examples

### 1. Create a Collection DTO

```typescript
import { ApiProperty } from "@nestjs/swagger";
import { PaginatedResponseDto } from "../../../../common/application/dto/paginated-response.dto";
import { YourItemResponseDto } from "./your-item-response.dto";

export class YourCollectionDto extends PaginatedResponseDto<YourItemResponseDto> {
  @ApiProperty({
    description: "Array of items",
    type: [YourItemResponseDto],
  })
  declare data: YourItemResponseDto[];

  constructor(
    data: YourItemResponseDto[],
    total: number,
    perpage: number,
    current_page: number,
  ) {
    super(data, total, perpage, current_page);
  }
}
```

### 2. Create a Query with Pagination

```typescript
import { PaginationQueryDto } from "../../../../common/application/dto/pagination-query.dto";

export class ListYourItemsQuery extends PaginationQueryDto {
  constructor(
    public readonly filter1?: string,
    public readonly filter2?: string,
    page?: number,
    limit?: number,
  ) {
    super(page, limit);
  }
}
```

### 3. Use in Handler

```typescript
@QueryHandler(ListYourItemsQuery)
export class ListYourItemsHandler
  implements IQueryHandler<ListYourItemsQuery, YourCollectionDto>
{
  async execute(query: ListYourItemsQuery): Promise<YourCollectionDto> {
    // Normalize pagination params
    const { page, limit, offset } = query.normalize();

    // Build filters
    const filters = {
      filter1: query.filter1,
      filter2: query.filter2,
    };

    // Fetch data and count in parallel
    const [items, total] = await Promise.all([
      this.repository.findMany(limit, offset, filters),
      this.repository.count(filters),
    ]);

    // Map to DTOs
    const data = items.map((item) => this.dtoMapper.toDto(item));

    // Return paginated response
    return new YourCollectionDto(data, total, limit, page);
  }
}
```

### 4. Use in Controller

```typescript
@Get()
@ApiQuery({
  name: "page",
  required: false,
  type: Number,
  description: "Page number (starts from 1)",
  example: 1,
})
@ApiQuery({
  name: "limit",
  required: false,
  type: Number,
  description: "Number of items per page",
  example: 20,
})
async list(
  @Query("filter1") filter1?: string,
  @Query("filter2") filter2?: string,
  @Query("page", new ParseIntPipe({ optional: true }))
  page: number = DEFAULT_PAGE_NUMBER,
  @Query("limit", new ParseIntPipe({ optional: true }))
  limit: number = DEFAULT_PAGE_SIZE,
): Promise<YourCollectionDto> {
  const query = new ListYourItemsQuery(filter1, filter2, page, limit);
  return this.queryBus.execute(query);
}
```

## Response Format

All paginated responses follow this format:

```json
{
  "data": [
    // ... array of items
  ],
  "meta": {
    "total": 100,
    "perpage": 20,
    "total_page": 5,
    "current_page": 1
  }
}
```

## Benefits

1. **Consistency**: All modules use the same pagination format
2. **Reusability**: No need to duplicate pagination logic
3. **Type Safety**: Generic types ensure type safety
4. **Maintainability**: Changes to pagination logic only need to be made in one place
5. **Validation**: Built-in validation and normalization of pagination params

