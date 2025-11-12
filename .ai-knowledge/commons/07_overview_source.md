# Tổng quan Source Code - Hệ thống quản lý Homestay & Hotel Booking

## 1. Cấu trúc Dự án

Dự án được chia thành **2 repositories riêng biệt**:

```
stayly-bookings/
├── app-stayly/          # Frontend Application (Next.js)
└── api-stayly/          # Backend API (NestJS)
```

---

## 2. Frontend (app-stayly)

### 2.1. Technology Stack

- **Framework:** Next.js 16.0.1
- **React:** 19.2.0
- **TypeScript:** ^5
- **Styling:** Tailwind CSS 4
- **Package Manager:** pnpm

### 2.2. Cấu trúc

```
app-stayly/
├── app/                 # Next.js App Router
│   ├── layout.tsx      # Root layout
│   ├── page.tsx        # Homepage
│   └── globals.css     # Global styles
├── public/             # Static assets
├── package.json
├── tsconfig.json
├── next.config.ts
└── tailwind.config.ts
```

### 2.3. Trạng thái

- **Phase:** Initial setup
- **Status:** Basic Next.js project structure
- **Next Steps:** Implement route groups cho admin và customer, setup shadcn/ui, integrate useSWR

---

## 3. Backend (api-stayly)

### 3.1. Technology Stack

- **Framework:** NestJS 11.0.1
- **Language:** TypeScript 5.7.3
- **Package Manager:** pnpm
- **Testing:** Jest

### 3.2. Cấu trúc

```
api-stayly/
├── src/
│   ├── main.ts         # Application entry point
│   ├── app.module.ts   # Root module
│   ├── app.controller.ts
│   └── app.service.ts
├── test/               # E2E tests
├── package.json
├── tsconfig.json
└── nest-cli.json
```

### 3.3. Trạng thái

- **Phase:** Initial setup
- **Status:** Basic NestJS project structure
- **Next Steps:** Implement bounded contexts, setup database (PostgreSQL), integrate Kafka, implement domain layer

---

## 4. Kiến trúc Tổng thể

### 4.1. Frontend Architecture

**Planned Structure:**
- **Route Groups:** `(admin)` và `(customer)` để tách biệt Admin Panel và Customer Frontend
- **Components:** Tách `admin/`, `customer/`, và `shared/` components
- **State Management:** Zustand cho global state, useSWR cho server state
- **UI Library:** shadcn/ui components
- **API Client:** useSWR hooks với centralized API client

### 4.2. Backend Architecture

**Planned Structure:**
- **Modular Monolith:** Bounded contexts như modules độc lập
- **Clean Architecture:** Domain, Application, Infrastructure, Presentation layers
- **DDD:** 13 Aggregate Roots theo domain model
- **CQRS:** Tách biệt Commands và Queries
- **Event-Driven:** Domain Events với Kafka

---

## 5. Dependencies & Tools

### 5.1. Frontend (app-stayly)

**Core:**
- Next.js 16
- React 19.2
- TypeScript 5

**Styling:**
- Tailwind CSS 4
- PostCSS

**Development:**
- ESLint
- TypeScript

### 5.2. Backend (api-stayly)

**Core:**
- NestJS 11
- TypeScript 5.7
- RxJS

**Development:**
- ESLint
- Prettier
- Jest (testing)
- TypeScript

---

## 6. Development Workflow

### 6.1. Package Manager

- **Both projects:** pnpm

### 6.2. Scripts

**Frontend:**
- `pnpm dev` - Development server
- `pnpm build` - Production build
- `pnpm start` - Production server
- `pnpm lint` - Lint code

**Backend:**
- `pnpm start:dev` - Development với watch mode
- `pnpm build` - Build project
- `pnpm start:prod` - Production server
- `pnpm test` - Run tests
- `pnpm lint` - Lint code

---

## 7. Trạng thái Hiện tại

### 7.1. Frontend (app-stayly)

- ✅ Next.js project initialized
- ✅ TypeScript configured
- ✅ Tailwind CSS 4 setup
- ⏳ Route groups structure (chưa implement)
- ⏳ shadcn/ui integration (chưa implement)
- ⏳ useSWR setup (chưa implement)
- ⏳ Authentication system (chưa implement)

### 7.2. Backend (api-stayly)

- ✅ NestJS project initialized
- ✅ TypeScript configured
- ✅ ESLint & Prettier configured
- ✅ Jest testing setup
- ⏳ Bounded contexts structure (chưa implement)
- ⏳ Database setup (chưa implement)
- ⏳ Domain layer (chưa implement)
- ⏳ API endpoints (chưa implement)

---

## 8. Next Steps

### 8.1. Frontend

1. Setup route groups `(admin)` và `(customer)`
2. Install và configure shadcn/ui
3. Setup useSWR với API client
4. Implement authentication system
5. Create base layouts cho admin và customer
6. Setup Zustand stores

### 8.2. Backend

1. Setup database (PostgreSQL) với TypeORM
2. Create bounded contexts structure
3. Implement domain layer (Aggregate Roots, Entities, Value Objects)
4. Setup Kafka integration
5. Implement application layer (Commands, Queries, Handlers)
6. Create API endpoints (Controllers)
7. Setup authentication & authorization

---

## 9. Project Organization

### 9.1. Monorepo Structure

Hiện tại là **2 repositories riêng biệt**, có thể chuyển sang monorepo sau nếu cần:
- Shared types
- Shared utilities
- Easier dependency management

### 9.2. Version Control

- **Git:** Version control
- **Branching:** Feature branches, develop, main
- **Commits:** Conventional Commits format

---

## 10. Documentation

### 10.1. Available Documentation

- **Business Overview:** `.ai-knowledge/commons/01_overview_bussiness.md`
- **Aggregate Roots:** `.ai-knowledge/commons/02_aggregate_root.md`
- **Architecture:** `.ai-knowledge/commons/03_architecture.md`
- **Conventions:** `.ai-knowledge/commons/04_conventions.md`
- **Design Patterns:** `.ai-knowledge/commons/05_design_parttern.md`
- **Development Conventions:** `.ai-knowledge/commons/06_development_conventions.md`
- **Frontend Overview:** `.ai-knowledge/commons/frontend/01_overview.md`
- **Frontend Architecture:** `.ai-knowledge/commons/frontend/02_structure_architecture.md`
- **Frontend Conventions:** `.ai-knowledge/commons/frontend/03_conventions.md`

### 10.2. Code Documentation

- **README.md:** Setup instructions trong mỗi project
- **Inline Comments:** JSDoc cho public APIs
- **Type Definitions:** TypeScript types serve as documentation

---

**Lưu ý:** Đây là tổng quan về source code hiện tại. Dự án đang ở giai đoạn initial setup và sẽ được phát triển theo kiến trúc đã định nghĩa trong các tài liệu architecture.

