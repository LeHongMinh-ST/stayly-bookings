# Frontend Structure & Architecture - Hệ thống quản lý Homestay & Hotel Booking

## 1. Tổng quan Kiến trúc

### 1.1. Kiến trúc tổng thể

Hệ thống frontend sử dụng **Single Project với Next.js Route Groups** để tách biệt Admin Panel và Customer Frontend trong cùng một codebase.

**Lý do chọn:**
- ✅ Shared code tự nhiên (types, utils, API client)
- ✅ Single codebase dễ maintain và refactor
- ✅ Next.js code splitting tự động
- ✅ Type safety với shared TypeScript types
- ✅ Single deployment đơn giản
- ✅ Phù hợp team nhỏ/trung bình

**Phân tách:**
- **Route Groups:** `(admin)` và `(customer)` để tách routing
- **Components:** Tách `admin/` và `customer/` components
- **Layouts:** Layout riêng cho từng phần
- **Authentication:** 2 auth systems riêng (users vs customers)

---

## 2. Cấu trúc Thư mục Chi tiết

### 2.1. Cấu trúc Root

```
frontend/
├── app/                          # Next.js App Router
│   ├── (admin)/                  # Admin Panel Route Group
│   ├── (customer)/               # Customer Frontend Route Group
│   ├── api/                      # API Routes (BFF)
│   ├── auth/                     # Shared Auth Routes
│   └── layout.tsx                 # Root Layout
│
├── components/                   # React Components
│   ├── ui/                       # shadcn/ui Components
│   ├── admin/                    # Admin-specific Components
│   ├── customer/                 # Customer-specific Components
│   └── shared/                   # Shared Components
│
├── lib/                          # Utilities & Config
│   ├── api/                      # API Client & SWR Hooks
│   ├── auth/                     # Authentication
│   ├── utils/                    # Utility Functions
│   └── constants/                # Constants
│
├── hooks/                        # Custom React Hooks
│   ├── use-auth.ts
│   ├── use-booking.ts
│   └── ...
│
├── store/                        # State Management (Zustand)
│   ├── auth-store.ts
│   ├── booking-store.ts
│   └── ...
│
├── types/                        # TypeScript Types
│   ├── accommodation.ts
│   ├── booking.ts
│   ├── user.ts
│   └── customer.ts
│
├── styles/                       # Global Styles
│   └── globals.css
│
├── public/                       # Static Assets
│   ├── images/
│   └── icons/
│
├── .env.local                    # Environment Variables
├── .env.example
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

### 2.2. App Router Structure (Next.js App Router)

```
app/
├── (admin)/                      # Route Group: Admin Panel
│   ├── admin/
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   │
│   │   ├── accommodations/
│   │   │   ├── page.tsx           # Danh sách
│   │   │   ├── create/
│   │   │   │   └── page.tsx
│   │   │   └── [id]/
│   │   │       ├── page.tsx       # Chi tiết
│   │   │       ├── edit/
│   │   │       │   └── page.tsx
│   │   │       └── floors/        # Quản lý tầng (Hotel)
│   │   │           └── page.tsx
│   │   │
│   │   ├── rooms/
│   │   │   ├── page.tsx
│   │   │   ├── create/
│   │   │   │   └── page.tsx
│   │   │   └── [id]/
│   │   │       └── page.tsx
│   │   │
│   │   ├── pricing/
│   │   │   ├── page.tsx
│   │   │   └── [roomId]/
│   │   │       └── page.tsx
│   │   │
│   │   ├── bookings/
│   │   │   ├── page.tsx
│   │   │   ├── calendar/
│   │   │   │   └── page.tsx
│   │   │   └── [id]/
│   │   │       └── page.tsx
│   │   │
│   │   ├── services/              # Hotel only
│   │   │   ├── page.tsx
│   │   │   ├── create/
│   │   │   │   └── page.tsx
│   │   │   └── [id]/
│   │   │       └── page.tsx
│   │   │
│   │   ├── payments/
│   │   │   ├── page.tsx
│   │   │   └── [id]/
│   │   │       └── page.tsx
│   │   │
│   │   ├── customers/
│   │   │   ├── page.tsx
│   │   │   └── [id]/
│   │   │       └── page.tsx
│   │   │
│   │   ├── reviews/
│   │   │   ├── page.tsx
│   │   │   └── [id]/
│   │   │       └── page.tsx
│   │   │
│   │   ├── promotions/
│   │   │   ├── page.tsx
│   │   │   ├── create/
│   │   │   │   └── page.tsx
│   │   │   └── [id]/
│   │   │       └── page.tsx
│   │   │
│   │   ├── users/                 # Super Admin, Owner only
│   │   │   ├── page.tsx
│   │   │   ├── create/
│   │   │   │   └── page.tsx
│   │   │   └── [id]/
│   │   │       └── page.tsx
│   │   │
│   │   └── reports/
│   │       ├── page.tsx
│   │       ├── revenue/
│   │       │   └── page.tsx
│   │       └── bookings/
│   │           └── page.tsx
│   │
│   └── layout.tsx                 # Admin Layout
│
├── (customer)/                    # Route Group: Customer Frontend
│   ├── page.tsx                   # Homepage
│   │
│   ├── search/
│   │   └── page.tsx
│   │
│   ├── accommodations/
│   │   └── [id]/
│   │       └── page.tsx
│   │
│   ├── rooms/
│   │   └── [id]/
│   │       └── page.tsx
│   │
│   ├── booking/
│   │   └── page.tsx
│   │
│   ├── payment/
│   │   └── page.tsx
│   │
│   ├── services/                  # Hotel services
│   │   ├── restaurant/
│   │   │   └── page.tsx
│   │   ├── spa/
│   │   │   └── page.tsx
│   │   └── meeting-room/
│   │       └── page.tsx
│   │
│   ├── my-bookings/               # Customer only
│   │   ├── page.tsx
│   │   └── [id]/
│   │       └── page.tsx
│   │
│   ├── my-account/                # Customer only
│   │   ├── page.tsx
│   │   ├── profile/
│   │   │   └── page.tsx
│   │   └── settings/
│   │       └── page.tsx
│   │
│   └── layout.tsx                  # Customer Layout
│
├── api/                           # API Routes (BFF)
│   ├── auth/
│   │   ├── login/
│   │   │   └── route.ts
│   │   ├── register/
│   │   │   └── route.ts
│   │   └── logout/
│   │       └── route.ts
│   │
│   ├── accommodations/
│   │   ├── route.ts               # GET, POST
│   │   └── [id]/
│   │       └── route.ts           # GET, PUT, DELETE
│   │
│   ├── bookings/
│   │   ├── route.ts
│   │   └── [id]/
│   │       └── route.ts
│   │
│   └── ...
│
├── auth/                          # Shared Auth Routes
│   ├── login/
│   │   └── page.tsx
│   ├── register/
│   │   └── page.tsx
│   └── forgot-password/
│       └── page.tsx
│
└── layout.tsx                     # Root Layout
```

### 2.3. Components Structure

```
components/
├── ui/                           # shadcn/ui Components
│   ├── button.tsx
│   ├── input.tsx
│   ├── card.tsx
│   ├── dialog.tsx
│   ├── dropdown-menu.tsx
│   ├── form.tsx
│   ├── table.tsx
│   ├── select.tsx
│   ├── calendar.tsx
│   ├── date-picker.tsx
│   ├── toast.tsx
│   ├── alert.tsx
│   ├── badge.tsx
│   ├── avatar.tsx
│   ├── tabs.tsx
│   ├── accordion.tsx
│   ├── sheet.tsx
│   ├── popover.tsx
│   └── ...
│
├── admin/                        # Admin-specific Components
│   ├── layout/
│   │   ├── AdminSidebar.tsx
│   │   ├── AdminHeader.tsx
│   │   └── AdminLayout.tsx
│   │
│   ├── dashboard/
│   │   ├── StatsCard.tsx
│   │   ├── RevenueChart.tsx
│   │   └── BookingChart.tsx
│   │
│   ├── accommodations/
│   │   ├── AccommodationTable.tsx
│   │   ├── AccommodationForm.tsx
│   │   └── FloorManagement.tsx
│   │
│   ├── rooms/
│   │   ├── RoomTable.tsx
│   │   ├── RoomForm.tsx
│   │   └── RoomStatusBadge.tsx
│   │
│   ├── bookings/
│   │   ├── BookingTable.tsx
│   │   ├── BookingCalendar.tsx
│   │   └── BookingDetail.tsx
│   │
│   ├── services/
│   │   ├── ServiceTable.tsx
│   │   ├── ServiceForm.tsx
│   │   └── ServiceBookingCalendar.tsx
│   │
│   └── ...
│
├── customer/                     # Customer-specific Components
│   ├── layout/
│   │   ├── CustomerHeader.tsx
│   │   ├── CustomerFooter.tsx
│   │   └── CustomerLayout.tsx
│   │
│   ├── search/
│   │   ├── SearchForm.tsx
│   │   ├── SearchFilters.tsx
│   │   └── SearchResults.tsx
│   │
│   ├── accommodations/
│   │   ├── AccommodationCard.tsx
│   │   ├── AccommodationGallery.tsx
│   │   ├── AccommodationInfo.tsx
│   │   ├── BookingWidget.tsx
│   │   └── RoomList.tsx
│   │
│   ├── booking/
│   │   ├── BookingForm.tsx
│   │   ├── BookingSummary.tsx
│   │   └── GuestInfoForm.tsx
│   │
│   ├── payment/
│   │   ├── PaymentMethodSelector.tsx
│   │   ├── PaymentForm.tsx
│   │   └── PaymentResult.tsx
│   │
│   └── ...
│
└── shared/                       # Shared Components
    ├── layout/
    │   ├── Header.tsx
    │   └── Footer.tsx
    │
    ├── map/
    │   └── MapView.tsx
    │
    ├── image/
    │   ├── ImageGallery.tsx
    │   └── ImageUpload.tsx
    │
    ├── forms/
    │   ├── DateRangePicker.tsx
    │   └── GuestSelector.tsx
    │
    └── ...
```

### 2.4. Lib Structure

```
lib/
├── api/                          # API Client & SWR Hooks
│   ├── client.ts                 # Fetch/Axios client setup
│   ├── swr-config.ts             # SWR global configuration
│   ├── accommodations/
│   │   ├── api.ts                # API functions
│   │   └── hooks.ts              # SWR hooks
│   ├── bookings/
│   │   ├── api.ts
│   │   └── hooks.ts
│   ├── payments/
│   │   ├── api.ts
│   │   └── hooks.ts
│   └── ...
│
├── auth/                         # Authentication
│   ├── config.ts                 # Auth config
│   ├── admin-auth.ts             # Admin authentication
│   ├── customer-auth.ts          # Customer authentication
│   └── guards.ts                 # Route guards
│
├── utils/                        # Utility Functions
│   ├── formatters.ts             # Date, currency formatters
│   ├── validators.ts             # Form validators
│   ├── helpers.ts                # Helper functions
│   └── ...
│
└── constants/                    # Constants
    ├── routes.ts                 # Route constants
    ├── api-endpoints.ts          # API endpoints
    └── ...
```

### 2.5. Hooks Structure

```
hooks/
├── use-auth.ts                   # Authentication hooks
├── use-booking.ts                # Booking hooks
├── use-accommodation.ts          # Accommodation hooks
├── use-payment.ts                # Payment hooks
└── ...
```

### 2.6. Store Structure (Zustand)

```
store/
├── auth-store.ts                 # Auth state
├── booking-store.ts              # Booking state (cart, temp data)
├── search-store.ts               # Search filters state
└── ...
```

### 2.7. Types Structure

```
types/
├── accommodation.ts
├── booking.ts
├── payment.ts
├── user.ts
├── customer.ts
├── api.ts                        # API response types
└── ...
```

---

## 3. shadcn/ui Integration

### 3.1. Setup shadcn/ui

**Installation:**
```bash
npx shadcn-ui@latest init
```

**Configuration (`components.json`):**
- Style: `default`
- RSC: `true`
- TSX: `true`
- Tailwind config với CSS variables
- Aliases: `@/components`, `@/lib/utils`

### 3.2. Components Usage

**Adding Components:**
- Button, Input, Form, Table, Calendar, DatePicker
- Dialog, Sheet, Popover, Dropdown Menu
- Toast, Alert, Badge, Avatar, Tabs, Accordion

**Component Location:**
- Tất cả components trong `components/ui/`
- Copy-paste vào project, có thể customize hoàn toàn
- Dựa trên Radix UI (accessible)

### 3.3. Customization

- Sử dụng Tailwind CSS để style
- CSS variables cho theming
- Dark mode support
- Custom variants và sizes

---

## 4. useSWR Integration

### 4.1. SWR Setup

**Global Configuration:**
- SWRConfig provider ở root layout
- Default fetcher function
- Global error handling
- Revalidation settings

### 4.2. API Client Structure

**Base Client:**
- Fetch wrapper với interceptors
- Request/Response transformation
- Error handling
- Token management

### 4.3. SWR Hooks Pattern

**Structure:**
```
lib/api/{resource}/
├── api.ts                        # API functions (GET, POST, PUT, DELETE)
└── hooks.ts                      # SWR hooks (useAccommodations, useBooking, etc.)
```

**Hook Naming:**
- `use{Resource}` cho GET list
- `use{Resource}ById` cho GET by ID
- `use{Resource}Mutation` cho POST/PUT/DELETE

**Examples:**
- `useAccommodations(filters)` - List accommodations
- `useAccommodationById(id)` - Get accommodation by ID
- `useCreateAccommodation()` - Create mutation
- `useUpdateAccommodation()` - Update mutation

### 4.4. SWR Features Usage

**Caching:**
- Automatic caching và revalidation
- Stale-while-revalidate strategy
- Cache key management

**Optimistic Updates:**
- Optimistic UI updates
- Rollback on error

**Pagination:**
- `useSWRInfinite` cho infinite scroll
- `useSWRPages` cho traditional pagination

**Real-time:**
- Polling với `refreshInterval`
- WebSocket integration (nếu cần)

---

## 5. Route Groups & Layouts

### 5.1. Route Groups Concept

**Route Groups** (`(admin)` và `(customer)`) là Next.js feature để:
- Tổ chức routes mà không ảnh hưởng URL structure
- Tách biệt layouts
- Code splitting tự động

**URL Structure:**
- `(admin)/admin/dashboard` → `/admin/dashboard`
- `(customer)/search` → `/search`
- Route groups không xuất hiện trong URL

### 5.2. Layout Hierarchy

```
Root Layout (app/layout.tsx)
├── Admin Layout (app/(admin)/layout.tsx)
│   └── Admin Panel Pages
│
└── Customer Layout (app/(customer)/layout.tsx)
    └── Customer Frontend Pages
```

**Layout Responsibilities:**
- Root Layout: HTML structure, fonts, global styles
- Admin Layout: Sidebar, Header, Admin-specific UI
- Customer Layout: Header, Footer, Customer-specific UI

---

## 6. Authentication & Authorization

### 6.1. Authentication Strategy

**2 Authentication Systems:**

1. **Admin Auth** (`lib/auth/admin-auth.ts`):
   - JWT token từ bảng `users`
   - Endpoint: `/api/auth/admin/login`
   - Storage: HttpOnly cookies hoặc localStorage

2. **Customer Auth** (`lib/auth/customer-auth.ts`):
   - JWT token từ bảng `customers`
   - Endpoint: `/api/auth/customer/login`
   - Storage: HttpOnly cookies hoặc localStorage

### 6.2. Route Guards

**Middleware (`middleware.ts`):**
- Protect admin routes (`/admin/*`)
- Protect customer routes (`/my-bookings/*`, `/my-account/*`)
- Redirect to login if not authenticated
- Check token validity

**Route-level Guards:**
- `requireAdminAuth()` helper
- `requireCustomerAuth()` helper
- Usage in page components

---

## 7. State Management

### 7.1. Zustand Stores

**Store Structure:**
- Auth Store: User session, authentication state
- Booking Store: Temporary booking data, cart
- Search Store: Search filters, search state
- UI Store: Modal state, sidebar state, etc.

**Store Pattern:**
- Separate stores by domain
- Actions và selectors
- Persist middleware cho important state

### 7.2. Server State (useSWR)

**SWR for Server State:**
- All API data fetching
- Automatic caching và revalidation
- Optimistic updates
- Error handling

**Local State (useState):**
- Component-specific state
- Form inputs
- UI toggles

---

## 8. API Client Structure

### 8.1. API Client Setup

**Base Client (`lib/api/client.ts`):**
- Fetch wrapper hoặc Axios instance
- Request interceptor: Add auth token
- Response interceptor: Handle errors, refresh token
- Base URL configuration

### 8.2. API Modules

**Structure:**
```
lib/api/{resource}/
├── api.ts                        # API functions
└── hooks.ts                      # SWR hooks
```

**API Functions:**
- GET: `get{Resource}(params)`
- GET by ID: `get{Resource}ById(id)`
- POST: `create{Resource}(data)`
- PUT: `update{Resource}(id, data)`
- DELETE: `delete{Resource}(id)`

### 8.3. SWR Hooks

**Hook Pattern:**
- `use{Resource}(params)` - List với filters
- `use{Resource}ById(id)` - Get by ID
- `use{Resource}Mutation()` - Mutations với optimistic updates

---

## 9. Code Splitting & Performance

### 9.1. Automatic Code Splitting

**Next.js App Router:**
- Mỗi route group là một chunk riêng
- `(admin)` và `(customer)` được split riêng
- Components được lazy load khi cần

### 9.2. Dynamic Imports

**Lazy Loading:**
- Heavy components (Charts, Calendar, Maps)
- Admin-only components trong customer routes
- Customer-only components trong admin routes

### 9.3. Image Optimization

**Next.js Image:**
- `next/image` component
- Automatic optimization
- Lazy loading
- Priority cho above-the-fold images

### 9.4. Bundle Optimization

**Strategies:**
- Tree shaking
- Code splitting
- Dynamic imports
- Bundle analysis

---

## 10. TypeScript Configuration

### 10.1. Path Aliases

**`tsconfig.json`:**
- `@/*` → root
- `@/components/*` → components
- `@/lib/*` → lib
- `@/hooks/*` → hooks
- `@/store/*` → store
- `@/types/*` → types

### 10.2. Type Definitions

**Type Organization:**
- Domain types trong `types/`
- API types trong `types/api.ts`
- Shared types cho admin và customer

---

## 11. Styling với Tailwind CSS

### 11.1. Tailwind Configuration

**Config Structure:**
- Custom colors
- Custom spacing
- Custom breakpoints
- Plugins (tailwindcss-animate)

### 11.2. CSS Variables (shadcn/ui)

**Global Styles:**
- CSS variables cho theming
- Dark mode variables
- Component-specific variables

### 11.3. Utility Classes

**Patterns:**
- Consistent spacing
- Responsive utilities
- Custom utility classes

---

## 12. Environment Variables

### 12.1. Environment Files

**Files:**
- `.env.local` - Local development
- `.env.example` - Template
- `.env.production` - Production (không commit)

### 12.2. Environment Variables

**Required:**
- `NEXT_PUBLIC_API_URL` - Backend API URL
- `NEXT_PUBLIC_JWT_SECRET` - JWT secret (optional)
- Payment gateway keys
- Maps API keys

---

## 13. Best Practices

### 13.1. Component Organization

- **Co-location:** Components gần nơi sử dụng
- **Reusability:** Shared components trong `components/shared/`
- **Separation:** Admin và Customer components tách biệt

### 13.2. File Naming

- **Components:** PascalCase (`BookingForm.tsx`)
- **Utils:** camelCase (`formatters.ts`)
- **Types:** camelCase (`booking.ts`)
- **Hooks:** camelCase với prefix `use` (`use-booking.ts`)

### 13.3. Code Organization

- **Single Responsibility:** Mỗi component/file một trách nhiệm
- **DRY:** Tránh duplicate, sử dụng shared utilities
- **Type Safety:** TypeScript strict mode

### 13.4. Performance

- **Code Splitting:** Dynamic imports cho heavy components
- **Image Optimization:** Next.js Image component
- **Caching:** SWR caching strategy
- **Bundle Size:** Monitor và optimize

### 13.5. Error Handling

- **API Errors:** Centralized error handling
- **Form Errors:** React Hook Form validation
- **User Feedback:** Toast notifications
- **Error Boundaries:** React Error Boundaries

---

## 14. Migration Path

### Phase 1: MVP (Current)
- Single project với route groups
- shadcn/ui cho cả admin và customer
- useSWR cho data fetching
- Shared codebase

### Phase 2: Scale (Future)
- Có thể tách thành monorepo nếu cần
- Hoặc giữ nguyên nếu vẫn phù hợp

### Phase 3: Enterprise (Future)
- Có thể tách thành 2 projects riêng nếu:
  - Team > 20 developers
  - Cần scale độc lập
  - Yêu cầu bảo mật cao

---

**Lưu ý:** Kiến trúc này được thiết kế cho giai đoạn MVP, có thể điều chỉnh dựa trên yêu cầu thực tế và chỉ dùng đê tham khảo.

