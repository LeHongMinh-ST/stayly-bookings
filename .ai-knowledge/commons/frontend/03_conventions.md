# Frontend Conventions & Best Practices - Hệ thống quản lý Homestay & Hotel Booking

## 1. Tổng quan

Tài liệu này định nghĩa các conventions và best practices cho frontend, đảm bảo tính nhất quán, dễ đọc và dễ maintain trong toàn bộ codebase.

**Nguyên tắc:**
- **Consistency:** Nhất quán trong toàn bộ dự án
- **Clarity:** Rõ ràng, dễ hiểu
- **Maintainability:** Dễ bảo trì và mở rộng
- **Type Safety:** TypeScript strict mode
- **Performance:** Tối ưu performance
- **Accessibility:** WCAG compliance

---

## 2. Naming Conventions

### 2.1. File Naming

**React Components:**
- **Components:** `PascalCase.tsx` (ví dụ: `BookingForm.tsx`, `AccommodationCard.tsx`)
- **Page Components:** `page.tsx` (Next.js App Router)
- **Layout Components:** `layout.tsx` (Next.js App Router)
- **API Routes:** `route.ts` (Next.js App Router)

**Utilities & Helpers:**
- **Utils:** `camelCase.ts` (ví dụ: `formatters.ts`, `validators.ts`)
- **Hooks:** `use-{name}.ts` hoặc `use{Name}.ts` (ví dụ: `use-booking.ts`, `useAuth.ts`)
- **Types:** `camelCase.ts` (ví dụ: `booking.ts`, `accommodation.ts`)
- **Constants:** `camelCase.ts` (ví dụ: `routes.ts`, `api-endpoints.ts`)

**Store (Zustand):**
- **Stores:** `{name}-store.ts` (ví dụ: `auth-store.ts`, `booking-store.ts`)

**API:**
- **API Functions:** `api.ts` trong `lib/api/{resource}/`
- **SWR Hooks:** `hooks.ts` trong `lib/api/{resource}/`

**Naming Pattern:**
- Sử dụng **kebab-case** cho file names (trừ React components)
- Sử dụng **descriptive names** - tên file phải mô tả rõ nội dung
- Tránh abbreviations trừ khi phổ biến (ví dụ: `api.ts`, `utils.ts`)

### 2.2. Component Naming

**Conventions:**
- **Components:** `PascalCase` (ví dụ: `BookingForm`, `AccommodationCard`)
- **Props Interface:** `{ComponentName}Props` (ví dụ: `BookingFormProps`, `AccommodationCardProps`)
- **Component Files:** Match component name (ví dụ: `BookingForm.tsx`)

**Examples:**
```typescript
// ✅ CORRECT
export function BookingForm({ bookingData }: BookingFormProps) {
  // ...
}

// ❌ WRONG
export function bookingForm(props: any) {
  // ...
}
```

### 2.3. Variable & Function Naming

**Conventions:**
- **Variables:** `camelCase` (ví dụ: `bookingId`, `customerName`, `totalAmount`)
- **Constants:** `UPPER_SNAKE_CASE` (ví dụ: `MAX_BOOKING_DURATION`, `API_BASE_URL`)
- **Functions:** `camelCase` với động từ (ví dụ: `createBooking()`, `calculatePrice()`, `validateEmail()`)
- **Boolean variables:** Prefix với `is`, `has`, `can`, `should` (ví dụ: `isAvailable`, `hasPermission`, `canCancel`, `shouldRefund`)
- **Arrays/Collections:** Plural form (ví dụ: `bookings`, `users`, `rooms`)
- **Event handlers:** Prefix với `handle` (ví dụ: `handleSubmit`, `handleClick`)

**Examples:**
```typescript
// ✅ CORRECT
const bookingId: string = '123'
const isAvailable: boolean = true
const bookings: Booking[] = []
const handleSubmit = () => {}

// ❌ WRONG
const booking_id: string = '123'
const available: boolean = true
const bookingList: Booking[] = []
const onSubmit = () => {}
```

### 2.4. Type & Interface Naming

**Conventions:**
- **Types:** `PascalCase` (ví dụ: `Booking`, `Accommodation`, `User`)
- **Interfaces:** `PascalCase` (ví dụ: `BookingFormProps`, `ApiResponse`)
- **Type Aliases:** `PascalCase` (ví dụ: `BookingStatus`, `PaymentMethod`)
- **Generic Types:** Single uppercase letter (ví dụ: `T`, `K`, `V`)

**Examples:**
```typescript
// ✅ CORRECT
interface BookingFormProps {
  bookingData: Booking
  onSubmit: (data: BookingData) => void
}

type BookingStatus = 'pending' | 'confirmed' | 'cancelled'

// ❌ WRONG
interface bookingFormProps {
  bookingData: any
  onSubmit: Function
}
```

---

## 3. Code Style & Formatting

### 3.1. TypeScript

**Strict Mode:**
- Enable `strict: true` trong `tsconfig.json`
- No `any` types (trừ khi thực sự cần thiết)
- Explicit return types cho functions
- Use `unknown` thay vì `any` khi không biết type

**Examples:**
```typescript
// ✅ CORRECT
function calculateTotal(price: number, quantity: number): number {
  return price * quantity
}

// ❌ WRONG
function calculateTotal(price: any, quantity: any): any {
  return price * quantity
}
```

### 3.2. ESLint & Prettier

**Configuration:**
- ESLint với Next.js và TypeScript rules
- Prettier cho code formatting
- Consistent formatting rules

**Rules:**
- No console.log (use proper logging)
- No unused variables
- Consistent quotes (single hoặc double)
- Semicolons (consistent)
- Trailing commas

### 3.3. Import Organization

**Order:**
1. React và Next.js imports
2. Third-party libraries
3. Internal components
4. Utilities và helpers
5. Types
6. Styles

**Examples:**
```typescript
// ✅ CORRECT
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useAccommodations } from '@/lib/api/accommodations/hooks'
import { formatCurrency } from '@/lib/utils/formatters'
import type { Accommodation } from '@/types/accommodation'
import styles from './styles.module.css'
```

---

## 4. Component Conventions

### 4.1. Component Structure

**Order:**
1. Imports
2. Types/Interfaces
3. Component function
4. Exports

**Examples:**
```typescript
// ✅ CORRECT
import { useState } from 'react'
import { Button } from '@/components/ui/button'

interface BookingFormProps {
  onSubmit: (data: BookingData) => void
}

export function BookingForm({ onSubmit }: BookingFormProps) {
  const [data, setData] = useState<BookingData>({})

  const handleSubmit = () => {
    onSubmit(data)
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* ... */}
    </form>
  )
}
```

### 4.2. Props

**Conventions:**
- Always define props interface
- Use destructuring cho props
- Default values với default parameters
- Optional props với `?`

**Examples:**
```typescript
// ✅ CORRECT
interface AccommodationCardProps {
  accommodation: Accommodation
  onSelect?: (id: string) => void
  showPrice?: boolean
}

export function AccommodationCard({
  accommodation,
  onSelect,
  showPrice = true,
}: AccommodationCardProps) {
  // ...
}

// ❌ WRONG
export function AccommodationCard(props: any) {
  // ...
}
```

### 4.3. Hooks Usage

**Rules:**
- Hooks chỉ được gọi ở top level
- Không gọi hooks trong conditions hoặc loops
- Custom hooks prefix với `use`
- Extract logic vào custom hooks khi reuse

**Examples:**
```typescript
// ✅ CORRECT
export function BookingForm() {
  const { data, error, mutate } = useBooking(bookingId)
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (error) return <Error message={error.message} />
  // ...
}

// ❌ WRONG
export function BookingForm() {
  if (someCondition) {
    const { data } = useBooking(bookingId) // ❌
  }
  // ...
}
```

### 4.4. Event Handlers

**Naming:**
- Prefix với `handle` (ví dụ: `handleSubmit`, `handleClick`)
- Inline handlers cho simple actions
- Extract to functions cho complex logic

**Examples:**
```typescript
// ✅ CORRECT
const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault()
  onSubmit(data)
}

const handleChange = (field: string, value: string) => {
  setData(prev => ({ ...prev, [field]: value }))
}

// ❌ WRONG
const onSubmit = () => {} // Should be handleSubmit
```

---

## 5. useSWR Conventions

### 5.1. Hook Naming

**Patterns:**
- `use{Resource}` - List với filters (ví dụ: `useAccommodations`)
- `use{Resource}ById` - Get by ID (ví dụ: `useAccommodationById`)
- `use{Resource}Mutation` - Mutations (ví dụ: `useCreateAccommodation`)

**Examples:**
```typescript
// ✅ CORRECT
const { data: accommodations, error } = useAccommodations(filters)
const { data: accommodation } = useAccommodationById(id)
const { trigger: createAccommodation } = useCreateAccommodation()

// ❌ WRONG
const { data } = useGetAccommodations() // Should be useAccommodations
```

### 5.2. SWR Key Management

**Conventions:**
- Consistent key structure
- Include all dependencies trong key
- Use array keys cho complex queries

**Examples:**
```typescript
// ✅ CORRECT
const key = ['accommodations', filters]
const { data } = useSWR(key, () => getAccommodations(filters))

// ❌ WRONG
const key = `accommodations-${JSON.stringify(filters)}` // Inconsistent
```

### 5.3. Error Handling

**Pattern:**
- Always check error state
- Show user-friendly error messages
- Handle loading states

**Examples:**
```typescript
// ✅ CORRECT
const { data, error, isLoading } = useAccommodations(filters)

if (isLoading) return <Loading />
if (error) return <Error message={error.message} />
if (!data) return null

return <AccommodationList accommodations={data} />
```

### 5.4. Mutations

**Pattern:**
- Use `useSWRMutation` cho mutations
- Optimistic updates khi có thể
- Revalidate after mutation

**Examples:**
```typescript
// ✅ CORRECT
const { trigger, isMutating } = useSWRMutation(
  ['accommodations'],
  createAccommodation,
  {
    onSuccess: () => {
      mutate(['accommodations']) // Revalidate
    },
  }
)
```

---

## 6. State Management Conventions

### 6.1. Zustand Stores

**Store Structure:**
- Separate stores by domain
- Actions và selectors
- Type-safe với TypeScript

**Examples:**
```typescript
// ✅ CORRECT
interface AuthState {
  user: User | null
  isAuthenticated: boolean
  login: (user: User) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  login: (user) => set({ user, isAuthenticated: true }),
  logout: () => set({ user: null, isAuthenticated: false }),
}))
```

### 6.2. When to Use What

**Zustand (Global State):**
- User session
- UI state (modals, sidebar)
- Temporary data (cart, booking form)

**useSWR (Server State):**
- All API data
- Caching và revalidation
- Optimistic updates

**useState (Local State):**
- Component-specific state
- Form inputs
- UI toggles

---

## 7. API Client Conventions

### 7.1. API Function Naming

**Patterns:**
- GET: `get{Resource}(params)`
- GET by ID: `get{Resource}ById(id)`
- POST: `create{Resource}(data)`
- PUT: `update{Resource}(id, data)`
- DELETE: `delete{Resource}(id)`

**Examples:**
```typescript
// ✅ CORRECT
export const accommodationsApi = {
  getAll: (filters: SearchFilters) => apiClient.get('/accommodations', { params: filters }),
  getById: (id: string) => apiClient.get(`/accommodations/${id}`),
  create: (data: CreateAccommodationDto) => apiClient.post('/accommodations', data),
  update: (id: string, data: UpdateAccommodationDto) => apiClient.put(`/accommodations/${id}`, data),
  delete: (id: string) => apiClient.delete(`/accommodations/${id}`),
}
```

### 7.2. Error Handling

**Pattern:**
- Centralized error handling
- Consistent error response format
- User-friendly error messages

**Examples:**
```typescript
// ✅ CORRECT
try {
  const data = await accommodationsApi.getAll(filters)
  return data
} catch (error) {
  if (error.response?.status === 404) {
    throw new NotFoundError('Accommodations not found')
  }
  throw new ApiError(error.message)
}
```

---

## 8. Form Conventions

### 8.1. React Hook Form

**Pattern:**
- Use React Hook Form cho tất cả forms
- Validation với zod hoặc yup
- Type-safe với TypeScript

**Examples:**
```typescript
// ✅ CORRECT
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { bookingSchema } from '@/lib/validators/booking'

export function BookingForm() {
  const form = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      checkInDate: new Date(),
      checkOutDate: new Date(),
    },
  })

  const onSubmit = (data: BookingFormData) => {
    // Handle submit
  }

  return (
    <Form {...form}>
      {/* ... */}
    </Form>
  )
}
```

### 8.2. Form Validation

**Pattern:**
- Schema-based validation (zod)
- Client-side validation
- Server-side validation error handling

---

## 9. Styling Conventions

### 9.1. Tailwind CSS

**Conventions:**
- Utility-first approach
- Consistent spacing (use Tailwind spacing scale)
- Responsive design (mobile-first)
- Custom utilities cho repeated patterns

**Examples:**
```typescript
// ✅ CORRECT
<div className="flex flex-col gap-4 p-6 md:flex-row md:gap-6">
  <Button className="w-full md:w-auto">Submit</Button>
</div>

// ❌ WRONG
<div style={{ display: 'flex', gap: '16px' }}> {/* Use Tailwind */}
```

### 9.2. Component Styling

**Pattern:**
- Use shadcn/ui components
- Customize với Tailwind classes
- CSS variables cho theming
- Avoid inline styles

### 9.3. Responsive Design

**Breakpoints:**
- Mobile: default (no prefix)
- Tablet: `md:` (768px+)
- Desktop: `lg:` (1024px+)
- Large: `xl:` (1280px+)

---

## 10. Accessibility Conventions

### 10.1. Semantic HTML

**Rules:**
- Use semantic HTML elements
- Proper heading hierarchy (h1 → h2 → h3)
- ARIA labels khi cần
- Alt text cho images

**Examples:**
```typescript
// ✅ CORRECT
<button aria-label="Close dialog" onClick={handleClose}>
  <XIcon />
</button>

<img src="accommodation.jpg" alt="Beautiful homestay with garden view" />

// ❌ WRONG
<div onClick={handleClose}> {/* Should be button */}
  <XIcon />
</div>
```

### 10.2. Keyboard Navigation

**Rules:**
- All interactive elements keyboard accessible
- Focus management
- Skip links cho long pages

### 10.3. Screen Readers

**Rules:**
- ARIA labels
- ARIA live regions cho dynamic content
- Proper form labels

---

## 11. Performance Best Practices

### 11.1. Code Splitting

**Rules:**
- Dynamic imports cho heavy components
- Route-based code splitting (automatic với Next.js)
- Component lazy loading

**Examples:**
```typescript
// ✅ CORRECT
import dynamic from 'next/dynamic'

const BookingCalendar = dynamic(() => import('@/components/admin/bookings/BookingCalendar'), {
  loading: () => <Loading />,
  ssr: false,
})
```

### 11.2. Image Optimization

**Rules:**
- Use Next.js Image component
- Proper sizing
- Lazy loading
- Priority cho above-the-fold images

**Examples:**
```typescript
// ✅ CORRECT
import Image from 'next/image'

<Image
  src="/accommodation.jpg"
  alt="Accommodation"
  width={800}
  height={600}
  priority // For above-the-fold
/>
```

### 11.3. Memoization

**Rules:**
- `useMemo` cho expensive calculations
- `useCallback` cho functions passed as props
- `React.memo` cho components (use sparingly)

**Examples:**
```typescript
// ✅ CORRECT
const expensiveValue = useMemo(() => {
  return calculateComplexValue(data)
}, [data])

const handleClick = useCallback(() => {
  onClick(id)
}, [id, onClick])
```

### 11.4. Bundle Size

**Rules:**
- Monitor bundle size
- Tree shaking
- Avoid large dependencies
- Code splitting

---

## 12. Error Handling Best Practices

### 12.1. Error Boundaries

**Pattern:**
- Error boundaries cho component trees
- Fallback UI
- Error logging

**Examples:**
```typescript
// ✅ CORRECT
<ErrorBoundary fallback={<ErrorFallback />}>
  <BookingForm />
</ErrorBoundary>
```

### 12.2. API Error Handling

**Pattern:**
- Consistent error response format
- User-friendly error messages
- Error logging (Sentry)

**Examples:**
```typescript
// ✅ CORRECT
const { data, error } = useAccommodations(filters)

if (error) {
  return <ErrorAlert message="Failed to load accommodations. Please try again." />
}
```

### 12.3. Form Error Handling

**Pattern:**
- Client-side validation
- Server-side error display
- Field-level errors

---

## 13. Testing Conventions

### 13.1. Unit Tests

**Pattern:**
- Test utilities và helpers
- Test custom hooks
- Test pure functions

**File Naming:**
- `{name}.test.ts` hoặc `{name}.spec.ts`

### 13.2. Component Tests

**Pattern:**
- React Testing Library
- Test user interactions
- Test accessibility

### 13.3. E2E Tests

**Pattern:**
- Cypress hoặc Playwright
- Critical user flows
- Booking process
- Payment flow

---

## 14. Git Conventions

### 14.1. Commit Messages

**Format:**
```
type(scope): subject

body (optional)
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Tests
- `chore`: Build, config changes

**Examples:**
```
feat(booking): add booking calendar component
fix(payment): handle payment gateway timeout
docs(readme): update installation instructions
```

### 14.2. Branch Naming

**Pattern:**
- `feature/{name}` - New features
- `fix/{name}` - Bug fixes
- `refactor/{name}` - Refactoring
- `docs/{name}` - Documentation

**Examples:**
```
feature/booking-calendar
fix/payment-timeout
refactor/api-client
```

---

## 15. Documentation Conventions

### 15.1. Code Comments

**Rules:**
- Comment complex logic
- JSDoc cho public functions
- Avoid obvious comments

**Examples:**
```typescript
// ✅ CORRECT
/**
 * Calculates the total price including taxes and fees
 * @param basePrice - Base room price per night
 * @param nights - Number of nights
 * @param taxRate - Tax rate (0-1)
 * @returns Total price with taxes
 */
function calculateTotalPrice(basePrice: number, nights: number, taxRate: number): number {
  // Complex calculation logic
  return basePrice * nights * (1 + taxRate)
}

// ❌ WRONG
// Calculate total price
function calculateTotalPrice(price: number, nights: number) {
  return price * nights // Obvious, no comment needed
}
```

### 15.2. README Files

**Structure:**
- Project overview
- Installation
- Usage
- Development
- Contributing

---

## 16. Security Best Practices

### 16.1. Authentication

**Rules:**
- Secure token storage (HttpOnly cookies preferred)
- Token refresh mechanism
- Logout on token expiry

### 16.2. Input Validation

**Rules:**
- Validate all user inputs
- Sanitize data
- Prevent XSS attacks

### 16.3. API Security

**Rules:**
- HTTPS only
- CORS configuration
- Rate limiting
- Input sanitization

---

## 17. Performance Monitoring

### 17.1. Metrics

**Track:**
- Page load time
- Time to First Byte (TTFB)
- Largest Contentful Paint (LCP)
- First Input Delay (FID)

### 17.2. Tools

**Use:**
- Next.js Analytics
- Web Vitals
- Lighthouse
- Sentry (performance monitoring)

---

## 18. Code Review Guidelines

### 18.1. Checklist

**Before Review:**
- Code follows conventions
- Tests pass
- No console.logs
- TypeScript errors resolved
- ESLint warnings fixed

### 18.2. Review Focus

**Check:**
- Code quality
- Performance
- Security
- Accessibility
- Test coverage

---

**Lưu ý:** Các conventions này sẽ được cập nhật thường xuyên dựa trên feedback và best practices mới.

