# Stayly Bookings - Hệ thống quản lý Homestay & Hotel Booking

Hệ thống quản lý đặt phòng cho homestay và khách sạn được xây dựng với NestJS (Backend) và Next.js (Frontend), sử dụng Clean Architecture và Domain-Driven Design.

## 📋 Mục lục

- [Tổng quan](#tổng-quan)
- [Kiến trúc](#kiến-trúc)
- [Prerequisites](#prerequisites)
- [Cài đặt](#cài-đặt)
- [Chạy dự án](#chạy-dự-án)
- [Development](#development)
- [Testing](#testing)
- [Docker](#docker)
- [Make Commands](#make-commands)
- [Tài liệu](#tài-liệu)

## 🎯 Tổng quan

**Stayly Bookings** là hệ thống quản lý đặt phòng cho homestay và khách sạn với các tính năng:

- **Quản lý cơ sở lưu trú:** Homestay và Hotel
- **Quản lý phòng:** Room types, pricing, availability
- **Booking system:** Đặt phòng, check-in/check-out
- **Payment integration:** Tích hợp cổng thanh toán (VNPay, MoMo)
- **Service management:** Quản lý dịch vụ khách sạn (Hotel)
- **Reviews & Ratings:** Đánh giá và nhận xét
- **Reporting:** Báo cáo doanh thu và thống kê

## 🏗️ Kiến trúc

### Technology Stack

**Backend:**
- **Framework:** NestJS 11
- **Language:** TypeScript 5.7
- **Database:** PostgreSQL 15
- **Cache:** Redis 7
- **Message Queue:** Apache Kafka
- **ORM:** TypeORM
- **Package Manager:** pnpm

**Frontend:**
- **Framework:** Next.js 16
- **React:** 19.2
- **Styling:** Tailwind CSS 4
- **Package Manager:** pnpm

**Architecture:**
- **Pattern:** Clean Architecture + DDD
- **Structure:** Modular Monolith với Bounded Contexts
- **CQRS:** Command Query Responsibility Segregation
- **Event-Driven:** Domain Events với Kafka

### Cấu trúc dự án

```
stayly-bookings/
├── api-stayly/          # Backend API (NestJS)
├── app-stayly/           # Frontend (Next.js)
├── docker-compose.yml    # Docker services configuration
├── Makefile             # Make commands
└── README.md            # This file
```

## 📦 Prerequisites

Trước khi bắt đầu, đảm bảo bạn đã cài đặt:

- **Node.js:** 20.x hoặc cao hơn
- **pnpm:** 8.x hoặc cao hơn
- **Docker:** 24.x hoặc cao hơn
- **Docker Compose:** 2.x hoặc cao hơn
- **Make:** (thường có sẵn trên Linux/macOS, Windows cần cài thêm)

**Kiểm tra cài đặt:**
```bash
node --version    # v20.x.x
pnpm --version    # 8.x.x
docker --version  # 24.x.x
docker-compose --version  # 2.x.x
make --version    # GNU Make 4.x
```

## 🚀 Cài đặt

### Bước 1: Clone Repository

```bash
git clone <repository-url>
cd stayly-bookings
```

### Bước 2: Setup Environment Variables

```bash
# Copy environment template
cp api-stayly/.env.example api-stayly/.env

# Edit environment variables
nano api-stayly/.env
```

**Các biến môi trường quan trọng:**
```env
# Database
DATABASE_HOST=localhost
DATABASE_PORT=5433
DATABASE_NAME=stayly_db
DATABASE_USER=stayly_user
DATABASE_PASSWORD=stayly_password

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Kafka
KAFKA_BROKERS=localhost:9092

# JWT
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_IN=15m
```

### Bước 3: Setup Dependencies và Docker Services

**Sử dụng Make (Recommended):**
```bash
make setup
```

Lệnh này sẽ:
- Cài đặt dependencies cho backend
- Khởi động Docker services (PostgreSQL, Redis, Kafka)

**Hoặc thực hiện thủ công:**
```bash
# Install dependencies
cd api-stayly && pnpm install

# Start Docker services
docker-compose up -d postgres redis zookeeper kafka
```

### Bước 4: Setup Database

```bash
# Run database migrations
make db-migrate

# Seed database (optional)
make db-seed
```

## 🏃 Chạy dự án

### Development Mode

**Start Backend:**
```bash
make start
```

Hoặc:
```bash
cd api-stayly
pnpm start:dev
```

**Backend sẽ chạy tại:** `http://localhost:3000`

**API Documentation:** `http://localhost:3000/api/docs` (khi đã setup Swagger)

### Start với Docker

**Start Backend trong Docker:**
```bash
make docker-up-api
```

**Start tất cả services bao gồm Kafka UI:**
```bash
make docker-up-tools
```

## 💻 Development

### Development Workflow

**1. Start Docker Services:**
```bash
make docker-up
```

**2. Start Backend:**
```bash
make start
```

**3. Check Status:**
```bash
make status
```

### Hot Reload

Backend tự động reload khi có thay đổi code (watch mode).

### Debug Mode

```bash
make start-debug
```

Hoặc:
```bash
cd api-stayly
pnpm start:debug
```

## 🧪 Testing

**Run Tests:**
```bash
make test
```

**Run Tests với Coverage:**
```bash
make test-cov
```

**Run Tests trong Watch Mode:**
```bash
make test-watch
```

**Run E2E Tests:**
```bash
make test-e2e
```

## 🐳 Docker

### Docker Services

Docker Compose bao gồm các services:

- **PostgreSQL:** Database (port 5433)
- **Redis:** Cache (port 6379)
- **Zookeeper:** Kafka coordination (port 2181)
- **Kafka:** Message queue (port 9092)
- **Kafka UI:** Kafka management UI (port 8080) - optional
- **Backend API:** NestJS application (port 3000) - optional

### Docker Commands

**Start Services:**
```bash
make docker-up              # Start infrastructure services
make docker-up-api          # Start with backend API
make docker-up-tools         # Start with Kafka UI
```

**Stop Services:**
```bash
make docker-down
```

**View Logs:**
```bash
make docker-logs            # All services
make docker-logs-api        # Backend API only
make docker-logs-postgres   # PostgreSQL only
make docker-logs-redis       # Redis only
make docker-logs-kafka       # Kafka only
```

**Check Status:**
```bash
make docker-ps
```

**Clean Everything (⚠️ deletes data):**
```bash
make docker-clean
```

### Connect to Services

**PostgreSQL:**
```bash
make db-connect
```

**Redis:**
```bash
make redis-connect
```

**Kafka Topics:**
```bash
make kafka-topics
```

## 🔧 Make Commands

Dự án sử dụng Makefile để quản lý các lệnh thường dùng.

### Setup & Installation

```bash
make setup          # Complete setup (install + docker-up)
make install        # Install backend dependencies
```

### Docker Management

```bash
make docker-up              # Start Docker services
make docker-up-api          # Start with backend API
make docker-up-tools        # Start with Kafka UI
make docker-down            # Stop Docker services
make docker-restart         # Restart Docker services
make docker-logs            # View all logs
make docker-ps              # Show services status
make docker-clean           # Clean everything (⚠️ deletes data)
```

### Development

```bash
make start                  # Start backend dev server
make start-debug            # Start in debug mode
make stop                   # Stop backend server
make restart                # Restart backend server
```

### Database

```bash
make db-connect             # Connect to PostgreSQL
make db-migrate             # Run migrations
make db-migrate-revert      # Revert last migration
make db-seed                # Seed database
make db-reset               # Reset database (⚠️ deletes data)
make db-backup              # Backup database
make db-restore FILE=...    # Restore from backup
```

### Redis

```bash
make redis-connect          # Connect to Redis CLI
make redis-flush            # Flush all Redis data (⚠️ deletes cache)
```

### Kafka

```bash
make kafka-topics                           # List all topics
make kafka-topic-create TOPIC=...           # Create topic
make kafka-topic-describe TOPIC=...         # Describe topic
make kafka-topic-delete TOPIC=...           # Delete topic
make kafka-consume TOPIC=...                # Consume messages
make kafka-produce TOPIC=...                # Produce messages
```

### Testing

```bash
make test                   # Run tests
make test-watch             # Run tests in watch mode
make test-cov               # Run tests with coverage
make test-e2e               # Run E2E tests
```

### Code Quality

```bash
make lint                   # Lint code
make format                 # Format code
```

### Build

```bash
make build                  # Build for production
make docker-build           # Build Docker image
```

### Cleanup

```bash
make clean                  # Clean build artifacts
make clean-all              # Clean everything including Docker
```

### Information

```bash
make status                 # Show services status
make info                   # Show project information
make help                   # Show all available commands
```

## 📚 Tài liệu

### Internal Documentation

Tất cả tài liệu được lưu trong thư mục `.ai-knowledge/`:

- **Architecture:** `.ai-knowledge/commons/03_architecture.md`
- **Conventions:** `.ai-knowledge/commons/04_conventions.md`
- **Design Patterns:** `.ai-knowledge/commons/05_design_parttern.md`
- **Development Conventions:** `.ai-knowledge/commons/06_development_conventions.md`
- **Development Tools:** `.ai-knowledge/commons/08_development_tool.md`
- **Aggregate Roots:** `.ai-knowledge/commons/02_aggregate_root.md`
- **Plan Overview:** `.ai-knowledge/plan/01_plan_overview.md`

### API Documentation

Khi backend đã được setup với Swagger:
- **Swagger UI:** `http://localhost:3000/api/docs`

## 🔍 Troubleshooting

### Docker Services Not Starting

```bash
# Check Docker status
make docker-ps

# View logs
make docker-logs

# Restart services
make docker-restart
```

### Port Already in Use

```bash
# Find process using port
lsof -i :3000
lsof -i :5433

# Kill process
kill -9 <PID>
```

### Database Connection Error

```bash
# Check PostgreSQL is running
make docker-ps

# Connect to database
make db-connect

# Reset database (⚠️ deletes data)
make db-reset
```

### Reset Development Environment

```bash
# Full reset (⚠️ deletes all data)
make clean-all
make setup
make db-migrate
make db-seed
```

## 🛠️ Development Tips

### 1. Daily Workflow

```bash
# Morning
git pull origin develop
make docker-up
make start

# Before committing
make test
make lint
make format
```

### 2. Database Migrations

```bash
# Create migration
cd api-stayly
pnpm migration:create --name CreateUsersTable

# Run migrations
make db-migrate

# Revert migration
make db-migrate-revert
```

### 3. Debugging

```bash
# Start in debug mode
make start:debug

# Connect debugger on port 9229
```

## 📝 Scripts

### Backend Scripts (api-stayly/package.json)

```bash
pnpm start:dev      # Development server
pnpm start:debug    # Debug mode
pnpm build          # Build for production
pnpm test           # Run tests
pnpm lint           # Lint code
pnpm format         # Format code
```

## 🔐 Security

- **Never commit `.env` files** - chỉ commit `.env.example`
- **Use strong passwords** cho databases
- **Rotate secrets** định kỳ
- **Enable SSL/TLS** cho production

## 📞 Support

Nếu gặp vấn đề:

1. Kiểm tra [Troubleshooting](#-troubleshooting)
2. Xem logs: `make docker-logs`
3. Kiểm tra status: `make status`
4. Xem tài liệu trong `.ai-knowledge/`

## 📄 License

UNLICENSED - Private project

---

**Happy Coding! 🚀**

