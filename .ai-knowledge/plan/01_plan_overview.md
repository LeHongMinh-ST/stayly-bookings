# Kế hoạch phát triển dự án - Homestay & Hotel Booking System

## 1. Tổng quan

**Mục tiêu:** Xây dựng hệ thống quản lý homestay và hotel booking với kiến trúc Modular Monolith, sử dụng NestJS, Next.js, PostgreSQL, và Kafka.

**Team size:** 2-5 developers (team nhỏ)

**Phương pháp:** Agile/Scrum với sprints 2 tuần

**Ưu tiên:** Phát triển các chức năng core trước, sau đó mở rộng dần

## 2. Phân tích ưu tiên chức năng

### 2.1. Chức năng Critical (Must Have - MVP)

**Lý do:** Các chức năng này là core của hệ thống, không có thì không thể vận hành

1. **Authentication & Authorization**
   - User Management (Super Admin, Owner, Manager, Staff)
   - Customer Registration & Login
   - RBAC (Role-Based Access Control)
   - JWT Authentication

2. **Accommodation Management**
   - Tạo và quản lý Homestay/Hotel
   - Duyệt Accommodation (Super Admin)
   - CRUD cơ bản

3. **Room Management**
   - Quản lý phòng cho Homestay (đơn giản)
   - Quản lý RoomType và Room cho Hotel (cơ bản)
   - Inventory management

4. **Pricing Management**
   - Giá cơ bản cho phòng
   - Dynamic pricing (mùa, ngày trong tuần) - cơ bản

5. **Booking Management**
   - Tìm kiếm và lọc cơ bản
   - Đặt phòng (booking flow)
   - Quản lý booking (xem, hủy)
   - Check-in/Check-out cơ bản

6. **Payment Integration**
   - Tích hợp 1 payment gateway (VNPay hoặc MoMo)
   - Xử lý thanh toán
   - Refund cơ bản

7. **Basic Notifications**
   - Email notifications (booking confirmation, payment success)
   - Sử dụng email service đơn giản

### 2.2. Chức năng Important (Should Have - Phase 2)

**Lý do:** Tăng trải nghiệm người dùng và tính năng quản lý

1. **Reviews & Ratings**
   - Đánh giá sau khi check-out
   - Hiển thị reviews

2. **Promotions**
   - Mã giảm giá cơ bản
   - Áp dụng promotion khi đặt phòng

3. **Advanced Search**
   - Full-text search với PostgreSQL
   - Filter nâng cao
   - Sort và pagination

4. **Reporting (Basic)**
   - Báo cáo doanh thu cơ bản
   - Báo cáo booking
   - Dashboard cho Owner/Manager

### 2.3. Chức năng Nice to Have (Phase 3+)

**Lý do:** Tính năng nâng cao, có thể làm sau

1. **Hotel-specific Features**
   - Floor Management
   - Room Status Management (dirty, clean, maintenance)
   - Hotel Services (nhà hàng, spa, etc.)
   - Standalone Service Booking

2. **Advanced Features**
   - Invoice Management (Hotel)
   - Revenue Sharing (chi tiết)
   - Advanced Analytics
   - Loyalty Program

3. **Enhancements**
   - Multiple payment gateways
   - SMS notifications
   - Advanced reporting
   - Mobile app

## 3. Kế hoạch phát triển theo Phases

### Phase 1: Foundation & Core MVP (8-10 tuần)

**Mục tiêu:** Có thể vận hành hệ thống cơ bản, cho phép đặt phòng và thanh toán

**Team:** 2-3 developers

#### Sprint 1-2: Setup & Infrastructure (2 tuần)

**Backend:**
- [ ] Setup NestJS project với cấu trúc bounded contexts
- [ ] Setup PostgreSQL database
- [ ] Setup Redis (cache, session)
- [ ] Setup Kafka (basic configuration)
- [ ] Setup Docker Compose cho development
- [ ] Setup CI/CD cơ bản (GitHub Actions)
- [ ] Setup logging (Winston/Pino)
- [ ] Setup error tracking (Sentry - free tier)

**Frontend:**
- [ ] Setup Next.js project
- [ ] Setup TypeScript, ESLint, Prettier
- [ ] Setup UI library (Tailwind CSS + shadcn/ui hoặc Ant Design)
- [ ] Setup state management (Zustand hoặc Redux Toolkit)
- [ ] Setup API client (Axios + interceptors)

**Common:**
- [ ] Setup shared code structure
- [ ] Setup common infrastructure (Kafka module, Database module)
- [ ] Setup authentication guards, interceptors

**Deliverables:**
- Development environment hoàn chỉnh
- Project structure theo bounded contexts
- Basic CI/CD pipeline

#### Sprint 3-4: Authentication & User Management (2 tuần)

**Bounded Context: User Management**

**Backend:**
- [ ] Domain: User entity, Role value object, UserPermission entity
- [ ] Application: Commands (CreateUser, UpdateUser), Queries (GetUser, ListUsers)
- [ ] Infrastructure: UserRepository, JWT service
- [ ] Presentation: UserController (CRUD)
- [ ] RBAC: Guards, Decorators (@Roles, @Permissions)

**Bounded Context: Customer Management**

**Backend:**
- [ ] Domain: Customer entity
- [ ] Application: Commands (RegisterCustomer, UpdateProfile), Queries (GetCustomer)
- [ ] Infrastructure: CustomerRepository
- [ ] Presentation: CustomerController (register, login, profile)

**Frontend:**
- [ ] Admin Panel: User management pages
- [ ] Customer Frontend: Registration, Login pages
- [ ] Auth context/hooks
- [ ] Protected routes

**Deliverables:**
- User management hoàn chỉnh
- Customer registration/login
- RBAC system

#### Sprint 5-6: Accommodation Management (2 tuần)

**Bounded Context: Accommodation Management**

**Backend:**
- [ ] Domain: Accommodation entity (abstract), Homestay, Hotel entities
- [ ] Domain: Floor entity (cho Hotel)
- [ ] Application: Commands (CreateAccommodation, UpdateAccommodation, ApproveAccommodation)
- [ ] Application: Queries (GetAccommodation, ListAccommodations, SearchAccommodations)
- [ ] Infrastructure: AccommodationRepository, FloorRepository
- [ ] Presentation: AccommodationController

**Frontend:**
- [ ] Admin Panel: Accommodation CRUD pages
- [ ] Admin Panel: Approval workflow
- [ ] Customer Frontend: Accommodation detail page (cơ bản)

**Deliverables:**
- Quản lý Homestay/Hotel
- Duyệt Accommodation
- Hiển thị Accommodation cho customer

#### Sprint 7-8: Room & Pricing Management (2 tuần)

**Bounded Context: Room Management**

**Backend:**
- [ ] Domain: Room entity (Homestay), RoomType & Room entities (Hotel)
- [ ] Application: Commands (CreateRoom, UpdateRoom, BlockRoom)
- [ ] Application: Queries (GetRoom, ListRooms, CheckAvailability)
- [ ] Infrastructure: RoomRepository, RoomTypeRepository
- [ ] Presentation: RoomController

**Bounded Context: Pricing Management**

**Backend:**
- [ ] Domain: Pricing entity, PricingStrategy
- [ ] Application: Commands (SetPrice, UpdatePrice)
- [ ] Application: Queries (GetPrice, CalculatePrice)
- [ ] Infrastructure: PricingRepository
- [ ] Domain Service: PriceCalculationService
- [ ] Presentation: PricingController

**Frontend:**
- [ ] Admin Panel: Room management pages
- [ ] Admin Panel: Pricing management pages
- [ ] Customer Frontend: Room detail page

**Deliverables:**
- Quản lý phòng (Homestay & Hotel)
- Quản lý giá cả
- Tính giá động cơ bản

#### Sprint 9-10: Booking Management (Core) (2 tuần)

**Bounded Context: Booking Management**

**Backend:**
- [ ] Domain: Booking entity, BookingStatus, BookingCode
- [ ] Application: Commands (CreateBooking, CancelBooking, CheckIn, CheckOut)
- [ ] Application: Queries (GetBooking, ListBookings, SearchBookings)
- [ ] Infrastructure: BookingRepository
- [ ] Domain Services: BookingCreationService, BookingAvailabilityService
- [ ] Presentation: BookingController
- [ ] Domain Events: BookingCreated, BookingConfirmed, BookingCancelled

**Bounded Context: Search (Basic)**

**Backend:**
- [ ] Application: SearchAccommodationsQuery (PostgreSQL full-text search)
- [ ] Infrastructure: SearchService
- [ ] Presentation: SearchController

**Frontend:**
- [ ] Customer Frontend: Search page với filters cơ bản
- [ ] Customer Frontend: Booking flow (chọn phòng → thông tin → xác nhận)
- [ ] Customer Frontend: Booking management (xem, hủy)
- [ ] Admin Panel: Booking management pages
- [ ] Admin Panel: Check-in/Check-out pages

**Deliverables:**
- Booking flow hoàn chỉnh
- Search cơ bản
- Quản lý booking

#### Sprint 11-12: Payment Integration (2 tuần)

**Bounded Context: Payment Management**

**Backend:**
- [ ] Domain: Payment entity, PaymentStatus
- [ ] Application: Commands (InitiatePayment, ProcessPayment, RefundPayment)
- [ ] Application: Queries (GetPayment, GetPaymentHistory)
- [ ] Infrastructure: PaymentRepository
- [ ] Infrastructure: PaymentGatewayService (VNPay hoặc MoMo)
- [ ] Domain Services: PaymentProcessingService, PaymentRefundService
- [ ] Presentation: PaymentController
- [ ] Domain Events: PaymentSucceeded, PaymentFailed, PaymentRefunded
- [ ] Saga: BookingSaga (Booking → Payment → Revenue)

**Frontend:**
- [ ] Customer Frontend: Payment page
- [ ] Customer Frontend: Payment gateway integration
- [ ] Admin Panel: Payment management

**Deliverables:**
- Payment integration hoàn chỉnh
- Refund functionality
- Payment flow với booking

#### Sprint 13-14: Notifications & Polish (2 tuần)

**Bounded Context: Notification Management**

**Backend:**
- [ ] Domain: Notification entity
- [ ] Application: Commands (SendEmail, SendSMS)
- [ ] Infrastructure: EmailService (SendGrid/Mailgun)
- [ ] Kafka Consumers: Consume domain events và gửi notifications
- [ ] Presentation: NotificationController

**Integration:**
- [ ] Kafka event handlers cho notifications
- [ ] Email templates
- [ ] Notification scheduling

**Testing & Polish:**
- [ ] Unit tests cho domain logic
- [ ] Integration tests cho API endpoints
- [ ] E2E tests cho critical flows
- [ ] Bug fixes
- [ ] Performance optimization cơ bản

**Deliverables:**
- Email notifications
- System hoàn chỉnh cho MVP
- Basic testing coverage

**Tổng kết Phase 1:**
- **Thời gian:** 14 tuần (3.5 tháng)
- **Team:** 2-3 developers
- **Kết quả:** MVP hoàn chỉnh, có thể đặt phòng và thanh toán

---

### Phase 2: Enhanced Features (6-8 tuần)

**Mục tiêu:** Tăng trải nghiệm người dùng và tính năng quản lý

**Team:** 2-4 developers

#### Sprint 15-16: Reviews & Ratings (2 tuần)

**Bounded Context: Review Management**

**Backend:**
- [ ] Domain: Review entity, Rating value object
- [ ] Application: Commands (CreateReview, UpdateReview, ApproveReview)
- [ ] Application: Queries (GetReview, ListReviews, GetAverageRating)
- [ ] Infrastructure: ReviewRepository
- [ ] Presentation: ReviewController

**Frontend:**
- [ ] Customer Frontend: Review form (sau check-out)
- [ ] Customer Frontend: Reviews display
- [ ] Admin Panel: Review approval

**Deliverables:**
- Review system hoàn chỉnh
- Rating display

#### Sprint 17-18: Promotions (2 tuần)

**Bounded Context: Promotion Management**

**Backend:**
- [ ] Domain: Promotion entity, PromotionCode
- [ ] Application: Commands (CreatePromotion, ApplyPromotion)
- [ ] Application: Queries (GetPromotion, ValidatePromotion)
- [ ] Infrastructure: PromotionRepository
- [ ] Domain Services: PromotionValidationService, PromotionApplicationService
- [ ] Presentation: PromotionController

**Frontend:**
- [ ] Admin Panel: Promotion management
- [ ] Customer Frontend: Apply promotion code khi booking

**Deliverables:**
- Promotion system
- Apply promotion khi đặt phòng

#### Sprint 19-20: Advanced Search & Filtering (2 tuần)

**Backend:**
- [ ] Enhance SearchAccommodationsQuery với advanced filters
- [ ] PostgreSQL full-text search optimization
- [ ] Geospatial search (PostGIS) cho maps
- [ ] Search result caching (Redis)

**Frontend:**
- [ ] Advanced search filters
- [ ] Map view (Google Maps/Mapbox)
- [ ] Search result pagination
- [ ] Sort options

**Deliverables:**
- Advanced search
- Map integration
- Better search performance

#### Sprint 21-22: Basic Reporting (2 tuần)

**Bounded Context: Reporting Management**

**Backend:**
- [ ] Application: Queries (GetRevenueReport, GetBookingReport, GetOccupancyReport)
- [ ] Infrastructure: ReportService (aggregate data từ database)
- [ ] Presentation: ReportController

**Frontend:**
- [ ] Admin Panel: Dashboard với charts
- [ ] Admin Panel: Revenue reports
- [ ] Admin Panel: Booking reports

**Deliverables:**
- Basic reporting
- Dashboard cho Owner/Manager

**Tổng kết Phase 2:**
- **Thời gian:** 8 tuần (2 tháng)
- **Team:** 2-4 developers
- **Kết quả:** Enhanced features, better UX

---

### Phase 3: Hotel-Specific Features (8-10 tuần)

**Mục tiêu:** Hoàn thiện tính năng cho Hotel

**Team:** 3-4 developers

#### Sprint 23-24: Floor Management (2 tuần)

**Backend:**
- [ ] Enhance Floor entity với floor_type
- [ ] Application: Commands (CreateFloor, UpdateFloor, BlockFloor)
- [ ] Application: Queries (GetFloor, ListFloors)
- [ ] Business rules: Block floor → block rooms/services

**Frontend:**
- [ ] Admin Panel: Floor management
- [ ] Display floors trong hotel detail

**Deliverables:**
- Floor management hoàn chỉnh

#### Sprint 25-26: Room Status Management (2 tuần)

**Backend:**
- [ ] Enhance Room entity với status management
- [ ] Application: Commands (UpdateRoomStatus)
- [ ] Domain Services: RoomStatusService
- [ ] Business rules: Status transitions

**Frontend:**
- [ ] Admin Panel: Room status dashboard
- [ ] Admin Panel: Update room status

**Deliverables:**
- Room status management

#### Sprint 27-28: Hotel Services (Basic) (2 tuần)

**Bounded Context: Service Management**

**Backend:**
- [ ] Domain: Service entity, ServiceItem entity
- [ ] Application: Commands (CreateService, UpdateService)
- [ ] Application: Queries (GetService, ListServices)
- [ ] Infrastructure: ServiceRepository
- [ ] Presentation: ServiceController

**Frontend:**
- [ ] Admin Panel: Service management
- [ ] Customer Frontend: Display services

**Deliverables:**
- Basic service management
- Display services

#### Sprint 29-30: Service Booking (Attached) (2 tuần)

**Backend:**
- [ ] Domain: ServiceBooking entity (attached to room booking)
- [ ] Application: Commands (CreateServiceBooking, CancelServiceBooking)
- [ ] Application: Queries (GetServiceBooking, ListServiceBookings)
- [ ] Infrastructure: ServiceBookingRepository
- [ ] Integration với Booking flow

**Frontend:**
- [ ] Customer Frontend: Select services khi đặt phòng
- [ ] Admin Panel: Service booking management

**Deliverables:**
- Service booking (attached to room)

#### Sprint 31-32: Standalone Service Booking (2 tuần)

**Backend:**
- [ ] Enhance ServiceBooking cho standalone
- [ ] Application: Commands (CreateStandaloneServiceBooking)
- [ ] Payment integration cho standalone booking
- [ ] Domain Events: ServiceBookingCreated, ServiceBookingConfirmed

**Frontend:**
- [ ] Customer Frontend: Standalone service booking flow
- [ ] Customer Frontend: Service booking management

**Deliverables:**
- Standalone service booking

**Tổng kết Phase 3:**
- **Thời gian:** 10 tuần (2.5 tháng)
- **Team:** 3-4 developers
- **Kết quả:** Hotel features hoàn chỉnh

---

### Phase 4: Advanced Features & Optimization (Ongoing)

**Mục tiêu:** Tối ưu và mở rộng tính năng

**Team:** 3-5 developers

#### Features:

1. **Invoice Management** (2 tuần)
   - Generate invoices khi check-out
   - Invoice history

2. **Revenue Sharing** (2 tuần)
   - Commission calculation
   - Payment to owners

3. **Advanced Analytics** (3 tuần)
   - Advanced reports
   - Data visualization
   - Export reports

4. **Multiple Payment Gateways** (2 tuần)
   - Thêm MoMo, ZaloPay
   - Payment gateway abstraction

5. **SMS Notifications** (1 tuần)
   - SMS service integration
   - OTP delivery

6. **Performance Optimization** (Ongoing)
   - Database query optimization
   - Caching strategy
   - API response time optimization

7. **Mobile App** (nếu cần) (8-12 tuần)
   - React Native app
   - Core features

## 4. Chi tiết từng Bounded Context theo Phase

### Phase 1 - Core Bounded Contexts

#### 1. User Management
- **Priority:** Critical
- **Effort:** 2 tuần
- **Dependencies:** None
- **Deliverables:**
  - User CRUD
  - RBAC system
  - JWT authentication

#### 2. Customer Management
- **Priority:** Critical
- **Effort:** 1 tuần
- **Dependencies:** None
- **Deliverables:**
  - Customer registration
  - Customer login
  - Profile management

#### 3. Accommodation Management
- **Priority:** Critical
- **Effort:** 2 tuần
- **Dependencies:** User Management
- **Deliverables:**
  - Accommodation CRUD
  - Approval workflow
  - Floor management (basic)

#### 4. Room Management
- **Priority:** Critical
- **Effort:** 2 tuần
- **Dependencies:** Accommodation Management
- **Deliverables:**
  - Room CRUD (Homestay)
  - RoomType & Room CRUD (Hotel)
  - Availability checking

#### 5. Pricing Management
- **Priority:** Critical
- **Effort:** 1.5 tuần
- **Dependencies:** Room Management
- **Deliverables:**
  - Pricing CRUD
  - Dynamic pricing (basic)
  - Price calculation

#### 6. Booking Management
- **Priority:** Critical
- **Effort:** 2 tuần
- **Dependencies:** Room Management, Pricing Management
- **Deliverables:**
  - Booking creation
  - Booking management
  - Check-in/Check-out
  - Domain events

#### 7. Payment Management
- **Priority:** Critical
- **Effort:** 2 tuần
- **Dependencies:** Booking Management
- **Deliverables:**
  - Payment integration
  - Refund
  - Payment events

#### 8. Notification Management
- **Priority:** Important
- **Effort:** 1 tuần
- **Dependencies:** Kafka, Booking, Payment
- **Deliverables:**
  - Email notifications
  - Event-driven notifications

### Phase 2 - Enhanced Bounded Contexts

#### 9. Review Management
- **Priority:** Important
- **Effort:** 2 tuần
- **Dependencies:** Booking Management

#### 10. Promotion Management
- **Priority:** Important
- **Effort:** 2 tuần
- **Dependencies:** Booking Management

#### 11. Reporting Management
- **Priority:** Important
- **Effort:** 2 tuần
- **Dependencies:** Booking, Payment, Revenue

### Phase 3 - Hotel-Specific Bounded Contexts

#### 12. Service Management
- **Priority:** Nice to Have
- **Effort:** 4 tuần
- **Dependencies:** Accommodation Management (Hotel)

## 5. Technical Tasks Breakdown

### 5.1. Infrastructure Setup (Sprint 1-2)

**Backend Infrastructure:**
- [ ] NestJS project initialization
- [ ] Database setup (PostgreSQL)
- [ ] Redis setup
- [ ] Kafka setup (Docker Compose)
- [ ] TypeORM configuration
- [ ] Environment configuration
- [ ] Logging setup
- [ ] Error handling setup

**Frontend Infrastructure:**
- [ ] Next.js project initialization
- [ ] TypeScript configuration
- [ ] UI library setup
- [ ] State management setup
- [ ] API client setup
- [ ] Routing setup

**DevOps:**
- [ ] Docker Compose cho local development
- [ ] CI/CD pipeline (GitHub Actions)
- [ ] Code quality tools (ESLint, Prettier)
- [ ] Pre-commit hooks

### 5.2. Common Infrastructure (Sprint 1-2)

**Common Modules:**
- [ ] Kafka module (producer, consumer base services)
- [ ] Database module (connection, transaction helpers)
- [ ] Cache module (Redis wrapper)
- [ ] Logger module
- [ ] Auth guards (JWT, Roles, Permissions)
- [ ] Interceptors (Logging, Cache, Transform)
- [ ] Exception filters
- [ ] Validation pipes

### 5.3. Domain Implementation Order

**Thứ tự implement các Aggregate Roots:**

1. **User** (Sprint 3-4)
   - Đơn giản, không phụ thuộc
   - Cần cho authentication

2. **Customer** (Sprint 3-4)
   - Đơn giản, không phụ thuộc
   - Cần cho booking

3. **Accommodation** (Sprint 5-6)
   - Phụ thuộc: User (owner)
   - Cần cho room và booking

4. **Room/RoomType** (Sprint 7-8)
   - Phụ thuộc: Accommodation
   - Cần cho booking

5. **Pricing** (Sprint 7-8)
   - Phụ thuộc: Room/RoomType
   - Cần cho booking

6. **Booking** (Sprint 9-10)
   - Phụ thuộc: Customer, Accommodation, Room, Pricing
   - Core business logic

7. **Payment** (Sprint 11-12)
   - Phụ thuộc: Booking
   - Cần cho revenue

8. **Revenue** (Sprint 11-12)
   - Phụ thuộc: Booking, Payment
   - Có thể làm đơn giản trong MVP

## 6. Frontend Development Plan

### 6.1. Admin Panel (Next.js)

**Phase 1:**
- [ ] Authentication pages (Login)
- [ ] Dashboard (basic)
- [ ] User management pages
- [ ] Accommodation management pages
- [ ] Room management pages
- [ ] Pricing management pages
- [ ] Booking management pages
- [ ] Payment management pages

**Phase 2:**
- [ ] Review management pages
- [ ] Promotion management pages
- [ ] Reporting pages
- [ ] Dashboard enhancements

**Phase 3:**
- [ ] Floor management pages
- [ ] Room status dashboard
- [ ] Service management pages
- [ ] Service booking management

### 6.2. Customer Frontend (Next.js)

**Phase 1:**
- [ ] Homepage
- [ ] Search page
- [ ] Accommodation detail page
- [ ] Room detail page
- [ ] Booking flow (multi-step)
- [ ] Payment page
- [ ] Booking management (my bookings)
- [ ] Profile page

**Phase 2:**
- [ ] Review form
- [ ] Reviews display
- [ ] Promotion code input
- [ ] Advanced search filters
- [ ] Map view

**Phase 3:**
- [ ] Service booking pages
- [ ] Standalone service booking

## 7. Testing Strategy

### 7.1. Phase 1 (MVP)

**Unit Tests:**
- Domain entities và value objects
- Domain services
- Business rules validation

**Integration Tests:**
- API endpoints (critical flows)
- Repository implementations
- Payment gateway integration

**E2E Tests:**
- Booking flow (end-to-end)
- Payment flow
- Authentication flow

**Coverage Target:** 60-70% cho critical paths

### 7.2. Phase 2+

- Tăng coverage lên 80%+
- Performance tests
- Load tests
- Security tests

## 8. Deployment Plan

### 8.1. Development Environment

- Docker Compose cho local development
- Tất cả services chạy local (PostgreSQL, Redis, Kafka)

### 8.2. Staging Environment

- Deploy lên cloud (AWS/GCP/Azure)
- Database: Managed PostgreSQL
- Cache: Managed Redis
- Kafka: Managed Kafka hoặc self-hosted
- CI/CD: Auto deploy to staging

### 8.3. Production Environment

- Blue-green deployment
- Database backups
- Monitoring và alerting
- Log aggregation

## 9. Risk Management

### 9.1. Technical Risks

**Risk:** Payment gateway integration phức tạp
- **Mitigation:** Bắt đầu sớm, có fallback plan
- **Timeline buffer:** +1 tuần

**Risk:** Kafka setup và configuration
- **Mitigation:** Setup sớm, test kỹ
- **Timeline buffer:** +0.5 tuần

**Risk:** Performance issues với search
- **Mitigation:** Optimize queries, caching
- **Timeline buffer:** +1 tuần

### 9.2. Business Risks

**Risk:** Requirements thay đổi
- **Mitigation:** Agile approach, regular reviews
- **Contingency:** 20% buffer time

**Risk:** Team member availability
- **Mitigation:** Knowledge sharing, documentation
- **Contingency:** Cross-training

## 10. Success Criteria

### Phase 1 (MVP) Success Criteria:

- [ ] User có thể đăng ký và đăng nhập
- [ ] Owner có thể tạo và quản lý homestay/hotel
- [ ] Customer có thể tìm kiếm và xem chi tiết accommodation
- [ ] Customer có thể đặt phòng và thanh toán
- [ ] Owner có thể quản lý booking và check-in/check-out
- [ ] Hệ thống gửi email notifications
- [ ] Payment integration hoạt động
- [ ] Basic reporting

### Phase 2 Success Criteria:

- [ ] Customer có thể đánh giá sau check-out
- [ ] Promotion system hoạt động
- [ ] Advanced search với filters
- [ ] Dashboard với reports

### Phase 3 Success Criteria:

- [ ] Hotel services management
- [ ] Standalone service booking
- [ ] Floor management
- [ ] Room status management

## 11. Timeline Summary

| Phase | Duration | Team Size | Key Deliverables |
|-------|----------|-----------|------------------|
| **Phase 1: MVP** | 14 tuần (3.5 tháng) | 2-3 devs | Core booking system, payment |
| **Phase 2: Enhanced** | 8 tuần (2 tháng) | 2-4 devs | Reviews, promotions, reports |
| **Phase 3: Hotel Features** | 10 tuần (2.5 tháng) | 3-4 devs | Hotel services, standalone booking |
| **Phase 4: Advanced** | Ongoing | 3-5 devs | Optimization, advanced features |

**Total MVP Timeline:** 14 tuần (3.5 tháng)

**Total Full System:** 32+ tuần (8+ tháng)

## 12. Resource Requirements

### 12.1. Team Composition

**Phase 1 (MVP):**
- 1 Backend Developer (NestJS, DDD)
- 1 Frontend Developer (Next.js, React)
- 1 Full-stack Developer (có thể làm cả 2)
- Optional: 1 DevOps (part-time)

**Phase 2+:**
- 2-3 Backend Developers
- 1-2 Frontend Developers
- 1 DevOps (part-time hoặc full-time)

### 12.2. Skills Required

**Backend:**
- NestJS, TypeScript
- DDD, CQRS patterns
- PostgreSQL
- Kafka
- Redis

**Frontend:**
- Next.js, React, TypeScript
- State management
- UI/UX design

**DevOps:**
- Docker, Docker Compose
- CI/CD (GitHub Actions)
- Cloud deployment

## 13. Dependencies & Blockers

### 13.1. External Dependencies

- Payment gateway API (VNPay/MoMo)
- Email service (SendGrid/Mailgun)
- Maps API (Google Maps/Mapbox) - Phase 2

### 13.2. Internal Dependencies

- Infrastructure setup phải hoàn thành trước
- Authentication phải hoàn thành trước các features khác
- Accommodation phải hoàn thành trước Room
- Room phải hoàn thành trước Booking
- Booking phải hoàn thành trước Payment

## 14. Next Steps

1. **Week 1:**
   - Setup project structure
   - Setup development environment
   - Setup CI/CD
   - Team alignment meeting

2. **Week 2:**
   - Bắt đầu implement User Management
   - Bắt đầu implement Customer Management
   - Setup common infrastructure

3. **Week 3+:**
   - Theo plan từng sprint
   - Daily standups
   - Sprint reviews
   - Retrospectives

---

**Lưu ý:** Plan này có thể điều chỉnh dựa trên:
- Team velocity
- Requirements changes
- Technical challenges
- Business priorities

**Recommendation:** Bắt đầu với Phase 1 (MVP), sau đó đánh giá lại và điều chỉnh plan cho các phases tiếp theo.

