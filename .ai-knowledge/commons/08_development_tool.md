# Development Tools & Setup - Hệ thống quản lý Homestay & Hotel Booking

## 1. Tổng quan

Tài liệu này mô tả cách setup môi trường development, sử dụng Docker Compose cho local development, và CI/CD pipeline với GitHub Actions.

**Mục tiêu:**
- Setup môi trường development nhanh chóng và nhất quán
- Sử dụng Docker Compose cho infrastructure services
- Tự động hóa testing và deployment với CI/CD
- Đảm bảo môi trường development giống production

---

## 2. Prerequisites

### 2.1. Required Software

**Core Tools:**
- **Node.js:** 20.x hoặc cao hơn
- **pnpm:** 8.x hoặc cao hơn (package manager)
- **Docker:** 24.x hoặc cao hơn
- **Docker Compose:** 2.x hoặc cao hơn
- **Git:** 2.x hoặc cao hơn

**Optional Tools:**
- **VS Code:** Recommended IDE
- **Postman/Insomnia:** API testing
- **DBeaver/TablePlus:** Database management
- **Redis Insight:** Redis management
- **Kafka UI:** Kafka management

### 2.2. System Requirements

**Minimum:**
- RAM: 8GB
- Disk: 20GB free space
- CPU: 4 cores

**Recommended:**
- RAM: 16GB+
- Disk: 50GB+ free space
- CPU: 8 cores+

---

## 3. Local Development Setup

### 3.1. Initial Setup

**Step 1: Clone Repository**
```bash
git clone <repository-url>
cd stayly-bookings
```

**Step 2: Setup Environment Variables**
```bash
# Copy environment templates
cp .env.example .env.local
cp api-stayly/.env.example api-stayly/.env
cp app-stayly/.env.example app-stayly/.env.local

# Edit environment variables
nano .env.local
nano api-stayly/.env
nano app-stayly/.env.local
```

**Step 3: Start Docker Services**
```bash
# Start infrastructure services (PostgreSQL, Redis, Kafka)
docker-compose up -d

# Check services status
docker-compose ps
```

**Step 4: Install Dependencies**
```bash
# Backend
cd api-stayly
pnpm install

# Frontend
cd ../app-stayly
pnpm install
```

**Step 5: Setup Database**
```bash
# Run database migrations
cd api-stayly
pnpm migration:run

# Seed database (optional)
pnpm seed
```

**Step 6: Start Development Servers**
```bash
# Terminal 1: Backend
cd api-stayly
pnpm start:dev

# Terminal 2: Frontend
cd app-stayly
pnpm dev
```

### 3.2. Development URLs

**Backend API:**
- Local: `http://localhost:3000`
- API Docs: `http://localhost:3000/api/docs` (Swagger)

**Frontend:**
- Customer Frontend: `http://localhost:3001`
- Admin Panel: `http://localhost:3001/admin`

**Infrastructure Services:**
- PostgreSQL: `localhost:5432`
- Redis: `localhost:6379`
- Kafka: `localhost:9092`
- Zookeeper: `localhost:2181` (nếu dùng Zookeeper)

---

## 4. Docker Compose Configuration

### 4.1. Docker Compose Structure

**File: `docker-compose.yml`**

```yaml
version: '3.8'

services:
  # PostgreSQL Database
  postgres:
    image: postgres:15-alpine
    container_name: stayly-postgres
    environment:
      POSTGRES_DB: ${POSTGRES_DB:-stayly_db}
      POSTGRES_USER: ${POSTGRES_USER:-stayly_user}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-stayly_password}
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - stayly-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER:-stayly_user}"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Redis Cache
  redis:
    image: redis:7-alpine
    container_name: stayly-redis
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    networks:
      - stayly-network
    command: redis-server --appendonly yes
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Zookeeper (for Kafka)
  zookeeper:
    image: confluentinc/cp-zookeeper:7.5.0
    container_name: stayly-zookeeper
    environment:
      ZOOKEEPER_CLIENT_PORT: 2181
      ZOOKEEPER_TICK_TIME: 2000
    ports:
      - "2181:2181"
    networks:
      - stayly-network
    healthcheck:
      test: ["CMD", "nc", "-z", "localhost", "2181"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Kafka
  kafka:
    image: confluentinc/cp-kafka:7.5.0
    container_name: stayly-kafka
    depends_on:
      - zookeeper
    ports:
      - "9092:9092"
      - "9093:9093"
    environment:
      KAFKA_BROKER_ID: 1
      KAFKA_ZOOKEEPER_CONNECT: zookeeper:2181
      KAFKA_ADVERTISED_LISTENERS: PLAINTEXT://localhost:9092,PLAINTEXT_INTERNAL://kafka:29092
      KAFKA_LISTENER_SECURITY_PROTOCOL_MAP: PLAINTEXT:PLAINTEXT,PLAINTEXT_INTERNAL:PLAINTEXT
      KAFKA_INTER_BROKER_LISTENER_NAME: PLAINTEXT_INTERNAL
      KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR: 1
      KAFKA_AUTO_CREATE_TOPICS_ENABLE: "true"
    volumes:
      - kafka_data:/var/lib/kafka/data
    networks:
      - stayly-network
    healthcheck:
      test: ["CMD", "kafka-broker-api-versions", "--bootstrap-server", "localhost:9092"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Kafka UI (Optional - for development)
  kafka-ui:
    image: provectuslabs/kafka-ui:latest
    container_name: stayly-kafka-ui
    depends_on:
      - kafka
    ports:
      - "8080:8080"
    environment:
      KAFKA_CLUSTERS_0_NAME: local
      KAFKA_CLUSTERS_0_BOOTSTRAPSERVERS: kafka:29092
      KAFKA_CLUSTERS_0_ZOOKEEPER: zookeeper:2181
    networks:
      - stayly-network

volumes:
  postgres_data:
  redis_data:
  kafka_data:

networks:
  stayly-network:
    driver: bridge
```

### 4.2. Docker Commands

**Start Services:**
```bash
# Start all services
docker-compose up -d

# Start specific service
docker-compose up -d postgres redis

# Start with logs
docker-compose up
```

**Stop Services:**
```bash
# Stop all services
docker-compose down

# Stop and remove volumes (⚠️ deletes data)
docker-compose down -v
```

**View Logs:**
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f postgres
docker-compose logs -f kafka
```

**Service Management:**
```bash
# Check status
docker-compose ps

# Restart service
docker-compose restart postgres

# Execute command in container
docker-compose exec postgres psql -U stayly_user -d stayly_db
docker-compose exec redis redis-cli
```

### 4.3. Database Management

**Connect to PostgreSQL:**
```bash
# Using docker-compose
docker-compose exec postgres psql -U stayly_user -d stayly_db

# Using local psql (if installed)
psql -h localhost -U stayly_user -d stayly_db
```

**Run Migrations:**
```bash
cd api-stayly
pnpm migration:run
```

**Rollback Migrations:**
```bash
cd api-stayly
pnpm migration:revert
```

**Seed Database:**
```bash
cd api-stayly
pnpm seed
```

### 4.4. Redis Management

**Connect to Redis:**
```bash
# Using docker-compose
docker-compose exec redis redis-cli

# Using local redis-cli (if installed)
redis-cli -h localhost -p 6379
```

**Common Redis Commands:**
```bash
# Check connection
PING

# List all keys
KEYS *

# Get value
GET key_name

# Clear all data (⚠️ careful)
FLUSHALL
```

### 4.5. Kafka Management

**Kafka Topics:**
```bash
# List topics
docker-compose exec kafka kafka-topics --bootstrap-server localhost:9092 --list

# Create topic
docker-compose exec kafka kafka-topics --bootstrap-server localhost:9092 --create --topic booking.created --partitions 3 --replication-factor 1

# Describe topic
docker-compose exec kafka kafka-topics --bootstrap-server localhost:9092 --describe --topic booking.created

# Delete topic
docker-compose exec kafka kafka-topics --bootstrap-server localhost:9092 --delete --topic booking.created
```

**Kafka Console Consumer:**
```bash
# Consume messages
docker-compose exec kafka kafka-console-consumer --bootstrap-server localhost:9092 --topic booking.created --from-beginning
```

**Kafka Console Producer:**
```bash
# Produce messages
docker-compose exec kafka kafka-console-producer --bootstrap-server localhost:9092 --topic booking.created
```

**Kafka UI:**
- URL: `http://localhost:8080`
- View topics, messages, consumer groups

---

## 5. Environment Variables

### 5.1. Root Environment Variables

**File: `.env.local`**

```env
# Application
NODE_ENV=development
APP_NAME=Stayly Bookings

# Database
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=stayly_db
POSTGRES_USER=stayly_user
POSTGRES_PASSWORD=stayly_password

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Kafka
KAFKA_BROKERS=localhost:9092
KAFKA_CLIENT_ID=stayly-api
KAFKA_GROUP_ID=stayly-consumer-group

# JWT
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=your-refresh-secret-key
JWT_REFRESH_EXPIRES_IN=7d

# API
API_PORT=3000
API_URL=http://localhost:3000
FRONTEND_URL=http://localhost:3001

# Email Service (SendGrid/Mailgun)
EMAIL_SERVICE_API_KEY=
EMAIL_FROM=noreply@stayly.com

# Payment Gateway (VNPay/MoMo)
VNPAY_TMN_CODE=
VNPAY_HASH_SECRET=
VNPAY_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
VNPAY_RETURN_URL=http://localhost:3001/payment/callback

# Maps (Google Maps/Mapbox)
GOOGLE_MAPS_API_KEY=
MAPBOX_ACCESS_TOKEN=

# File Storage (Local/MinIO)
FILE_STORAGE_TYPE=local
FILE_STORAGE_PATH=./uploads
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_ACCESS_KEY=
MINIO_SECRET_KEY=
MINIO_BUCKET=stayly-uploads
```

### 5.2. Backend Environment Variables

**File: `api-stayly/.env`**

```env
# Application
NODE_ENV=development
PORT=3000

# Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=stayly_db
DATABASE_USER=stayly_user
DATABASE_PASSWORD=stayly_password
DATABASE_SYNCHRONIZE=false
DATABASE_LOGGING=true

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_TTL=3600

# Kafka
KAFKA_BROKERS=localhost:9092
KAFKA_CLIENT_ID=stayly-api
KAFKA_GROUP_ID=stayly-consumer-group

# JWT
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=your-refresh-secret-key
JWT_REFRESH_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=http://localhost:3001

# Logging
LOG_LEVEL=debug
LOG_FORMAT=json

# Email
EMAIL_SERVICE=sendgrid
EMAIL_API_KEY=
EMAIL_FROM=noreply@stayly.com

# Payment
PAYMENT_GATEWAY=vnpay
VNPAY_TMN_CODE=
VNPAY_HASH_SECRET=
VNPAY_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html

# File Storage
FILE_STORAGE_TYPE=local
FILE_STORAGE_PATH=./uploads
```

### 5.3. Frontend Environment Variables

**File: `app-stayly/.env.local`**

```env
# Application
NODE_ENV=development
NEXT_PUBLIC_APP_NAME=Stayly Bookings

# API
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_API_VERSION=v1

# Authentication
NEXT_PUBLIC_JWT_STORAGE_KEY=stayly_token
NEXT_PUBLIC_REFRESH_TOKEN_KEY=stayly_refresh_token

# Payment Gateway
NEXT_PUBLIC_VNPAY_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html

# Maps
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=

# Analytics (Optional)
NEXT_PUBLIC_GA_ID=
NEXT_PUBLIC_SENTRY_DSN=
```

### 5.4. Environment Files Structure

```
stayly-bookings/
├── .env.example                    # Root template
├── .env.local                      # Local development (gitignored)
│
├── api-stayly/
│   ├── .env.example               # Backend template
│   └── .env                       # Backend local (gitignored)
│
└── app-stayly/
    ├── .env.example               # Frontend template
    └── .env.local                 # Frontend local (gitignored)
```

---

## 6. CI/CD với GitHub Actions

### 6.1. CI Pipeline

**File: `.github/workflows/ci.yml`**

```yaml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  lint-and-test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:15-alpine
        env:
          POSTGRES_DB: stayly_test
          POSTGRES_USER: test_user
          POSTGRES_PASSWORD: test_password
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
      
      redis:
        image: redis:7-alpine
        ports:
          - 6379:6379
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'

      - name: Install pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8

      # Backend
      - name: Install backend dependencies
        working-directory: ./api-stayly
        run: pnpm install --frozen-lockfile

      - name: Lint backend
        working-directory: ./api-stayly
        run: pnpm lint

      - name: Run backend tests
        working-directory: ./api-stayly
        run: pnpm test
        env:
          DATABASE_HOST: localhost
          DATABASE_PORT: 5432
          DATABASE_NAME: stayly_test
          DATABASE_USER: test_user
          DATABASE_PASSWORD: test_password
          REDIS_HOST: localhost
          REDIS_PORT: 6379

      # Frontend
      - name: Install frontend dependencies
        working-directory: ./app-stayly
        run: pnpm install --frozen-lockfile

      - name: Lint frontend
        working-directory: ./app-stayly
        run: pnpm lint

      - name: Build frontend
        working-directory: ./app-stayly
        run: pnpm build
        env:
          NEXT_PUBLIC_API_URL: http://localhost:3000

      - name: Run frontend tests
        working-directory: ./app-stayly
        run: pnpm test

  security-scan:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Run Trivy vulnerability scanner
        uses: aquasecurity/trivy-action@master
        with:
          scan-type: 'fs'
          scan-ref: '.'
          format: 'sarif'
          output: 'trivy-results.sarif'

      - name: Upload Trivy results to GitHub Security
        uses: github/codeql-action/upload-sarif@v2
        with:
          sarif_file: 'trivy-results.sarif'
```

### 6.2. Deploy to Staging

**File: `.github/workflows/deploy-staging.yml`**

```yaml
name: Deploy to Staging

on:
  push:
    branches: [develop]
  workflow_dispatch:

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment:
      name: staging
      url: https://staging.stayly.com

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'

      - name: Install pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8

      # Build Backend
      - name: Install backend dependencies
        working-directory: ./api-stayly
        run: pnpm install --frozen-lockfile --prod=false

      - name: Build backend
        working-directory: ./api-stayly
        run: pnpm build

      # Build Frontend
      - name: Install frontend dependencies
        working-directory: ./app-stayly
        run: pnpm install --frozen-lockfile --prod=false

      - name: Build frontend
        working-directory: ./app-stayly
        run: pnpm build
        env:
          NEXT_PUBLIC_API_URL: ${{ secrets.STAGING_API_URL }}

      # Deploy (example with Docker)
      - name: Build Docker images
        run: |
          docker build -t stayly-api:staging ./api-stayly
          docker build -t stayly-app:staging ./app-stayly

      - name: Deploy to staging
        run: |
          # Add your deployment commands here
          # Example: docker-compose -f docker-compose.staging.yml up -d
          echo "Deploy to staging server"
```

### 6.3. Deploy to Production

**File: `.github/workflows/deploy-production.yml`**

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]
  workflow_dispatch:

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment:
      name: production
      url: https://stayly.com

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'

      - name: Install pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8

      # Run full test suite
      - name: Run tests
        run: |
          cd api-stayly && pnpm test
          cd ../app-stayly && pnpm test

      # Build Backend
      - name: Build backend
        working-directory: ./api-stayly
        run: |
          pnpm install --frozen-lockfile --prod=false
          pnpm build

      # Build Frontend
      - name: Build frontend
        working-directory: ./app-stayly
        run: |
          pnpm install --frozen-lockfile --prod=false
          pnpm build
        env:
          NEXT_PUBLIC_API_URL: ${{ secrets.PRODUCTION_API_URL }}

      # Deploy (example)
      - name: Deploy to production
        run: |
          # Add your production deployment commands here
          # Example: Blue-green deployment, rolling update, etc.
          echo "Deploy to production server"
```

### 6.4. GitHub Actions Secrets

**Required Secrets:**

**Staging:**
- `STAGING_API_URL`
- `STAGING_DATABASE_URL`
- `STAGING_REDIS_URL`
- `STAGING_KAFKA_BROKERS`
- `STAGING_JWT_SECRET`
- `STAGING_DEPLOY_KEY`

**Production:**
- `PRODUCTION_API_URL`
- `PRODUCTION_DATABASE_URL`
- `PRODUCTION_REDIS_URL`
- `PRODUCTION_KAFKA_BROKERS`
- `PRODUCTION_JWT_SECRET`
- `PRODUCTION_DEPLOY_KEY`

**Setup Secrets:**
1. Go to GitHub repository
2. Settings → Secrets and variables → Actions
3. Add new repository secret

---

## 7. Development Workflow

### 7.1. Daily Development Workflow

**Morning:**
```bash
# 1. Pull latest changes
git pull origin develop

# 2. Start Docker services
docker-compose up -d

# 3. Check services status
docker-compose ps

# 4. Start backend
cd api-stayly
pnpm start:dev

# 5. Start frontend (new terminal)
cd app-stayly
pnpm dev
```

**During Development:**
- Write code
- Run tests locally: `pnpm test`
- Check linting: `pnpm lint`
- Test API endpoints
- Test frontend features

**Before Committing:**
```bash
# 1. Run tests
pnpm test

# 2. Run linter
pnpm lint

# 3. Format code
pnpm format

# 4. Check git status
git status

# 5. Commit with conventional commit message
git commit -m "feat(booking): add booking cancellation feature"
```

### 7.2. Branch Workflow

**Branch Strategy:**
```
main (production)
  └── develop (staging)
      ├── feature/booking-cancellation
      ├── bugfix/payment-timeout
      └── hotfix/security-vulnerability
```

**Workflow:**
1. Create feature branch từ `develop`
2. Develop và commit changes
3. Push branch và create Pull Request
4. CI pipeline chạy tự động
5. Code review
6. Merge vào `develop` (auto deploy to staging)
7. Merge `develop` vào `main` (manual approval, deploy to production)

### 7.3. Testing Workflow

**Unit Tests:**
```bash
# Backend
cd api-stayly
pnpm test

# Frontend
cd app-stayly
pnpm test
```

**Integration Tests:**
```bash
# Backend
cd api-stayly
pnpm test:integration

# Frontend
cd app-stayly
pnpm test:integration
```

**E2E Tests:**
```bash
# Run E2E tests
pnpm test:e2e
```

### 7.4. Database Migration Workflow

**Create Migration:**
```bash
cd api-stayly
pnpm migration:create --name CreateUsersTable
```

**Run Migrations:**
```bash
# Development
pnpm migration:run

# Production (via CI/CD)
pnpm migration:run --env production
```

**Revert Migration:**
```bash
pnpm migration:revert
```

---

## 8. Troubleshooting

### 8.1. Common Issues

**Docker Services Not Starting:**
```bash
# Check Docker status
docker ps

# Check logs
docker-compose logs

# Restart services
docker-compose restart
```

**Port Already in Use:**
```bash
# Find process using port
lsof -i :3000
lsof -i :5432

# Kill process
kill -9 <PID>
```

**Database Connection Error:**
```bash
# Check PostgreSQL is running
docker-compose ps postgres

# Check connection
docker-compose exec postgres psql -U stayly_user -d stayly_db

# Reset database (⚠️ deletes data)
docker-compose down -v
docker-compose up -d postgres
```

**Redis Connection Error:**
```bash
# Check Redis is running
docker-compose ps redis

# Test connection
docker-compose exec redis redis-cli ping
```

**Kafka Connection Error:**
```bash
# Check Kafka is running
docker-compose ps kafka

# Check topics
docker-compose exec kafka kafka-topics --bootstrap-server localhost:9092 --list
```

### 8.2. Reset Development Environment

**Full Reset (⚠️ deletes all data):**
```bash
# Stop and remove all containers and volumes
docker-compose down -v

# Remove node_modules
rm -rf api-stayly/node_modules
rm -rf app-stayly/node_modules

# Reinstall dependencies
cd api-stayly && pnpm install
cd ../app-stayly && pnpm install

# Start services
docker-compose up -d

# Run migrations
cd api-stayly && pnpm migration:run
```

---

## 9. Production Deployment

### 9.1. Deployment Checklist

**Pre-deployment:**
- [ ] All tests passing
- [ ] Code review completed
- [ ] Documentation updated
- [ ] Environment variables configured
- [ ] Database migrations ready
- [ ] Backup database (production)

**Deployment:**
- [ ] Deploy backend
- [ ] Run database migrations
- [ ] Deploy frontend
- [ ] Verify services are running
- [ ] Run smoke tests
- [ ] Monitor logs

**Post-deployment:**
- [ ] Verify API endpoints
- [ ] Verify frontend is accessible
- [ ] Check error logs
- [ ] Monitor performance
- [ ] Notify team

### 9.2. Rollback Procedure

**If deployment fails:**
```bash
# 1. Revert to previous version
git revert <commit-hash>

# 2. Redeploy previous version
# (Follow deployment steps)

# 3. Rollback database migrations (if needed)
pnpm migration:revert
```

---

## 10. Monitoring & Logging

### 10.1. Application Logs

**Backend Logs:**
```bash
# Development
cd api-stayly
pnpm start:dev  # Logs in console

# Production
docker-compose logs -f api
```

**Frontend Logs:**
```bash
# Development
cd app-stayly
pnpm dev  # Logs in console

# Production
docker-compose logs -f app
```

### 10.2. Infrastructure Logs

**Docker Logs:**
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f postgres
docker-compose logs -f redis
docker-compose logs -f kafka
```

### 10.3. Monitoring Tools

**Development:**
- Docker Compose logs
- Application console logs
- Browser DevTools

**Production:**
- Sentry (error tracking)
- Prometheus + Grafana (metrics)
- ELK Stack (log aggregation)

---

## 11. Best Practices

### 11.1. Development

- **Always pull latest changes** trước khi bắt đầu làm việc
- **Run tests locally** trước khi commit
- **Write meaningful commit messages** theo conventional commits
- **Keep branches small** và focused
- **Review code** trước khi merge

### 11.2. Docker

- **Don't commit `.env` files** - chỉ commit `.env.example`
- **Use volumes** cho data persistence
- **Clean up unused resources** định kỳ: `docker system prune`
- **Keep images updated** - pull latest images

### 11.3. CI/CD

- **Keep CI fast** - optimize test execution
- **Fail fast** - stop pipeline nếu có lỗi
- **Use caching** - cache dependencies
- **Monitor deployments** - track success/failure rates

### 11.4. Security

- **Never commit secrets** - sử dụng environment variables
- **Rotate secrets** định kỳ
- **Use strong passwords** cho databases
- **Enable SSL/TLS** cho production
- **Regular security audits**

---

## 12. Resources & Documentation

### 12.1. Official Documentation

- **NestJS:** https://docs.nestjs.com
- **Next.js:** https://nextjs.org/docs
- **Docker:** https://docs.docker.com
- **GitHub Actions:** https://docs.github.com/en/actions
- **PostgreSQL:** https://www.postgresql.org/docs
- **Redis:** https://redis.io/docs
- **Kafka:** https://kafka.apache.org/documentation

### 12.2. Internal Documentation

- **Architecture:** `.ai-knowledge/commons/03_architecture.md`
- **Conventions:** `.ai-knowledge/commons/04_conventions.md`
- **Design Patterns:** `.ai-knowledge/commons/05_design_parttern.md`
- **Development Conventions:** `.ai-knowledge/commons/06_development_conventions.md`
- **Frontend Overview:** `.ai-knowledge/commons/frontend/01_overview.md`

---

## 13. Quick Reference

### 13.1. Common Commands

```bash
# Docker
docker-compose up -d              # Start services
docker-compose down               # Stop services
docker-compose logs -f            # View logs
docker-compose ps                 # Check status
docker-compose restart <service>  # Restart service

# Backend
cd api-stayly
pnpm start:dev                    # Start dev server
pnpm test                         # Run tests
pnpm lint                         # Lint code
pnpm migration:run                # Run migrations

# Frontend
cd app-stayly
pnpm dev                          # Start dev server
pnpm build                        # Build for production
pnpm lint                         # Lint code
pnpm test                         # Run tests
```

### 13.2. URLs

- **Backend API:** http://localhost:3000
- **Frontend:** http://localhost:3001
- **Kafka UI:** http://localhost:8080
- **PostgreSQL:** localhost:5432
- **Redis:** localhost:6379
- **Kafka:** localhost:9092

---

**Lưu ý:** Tài liệu này sẽ được cập nhật thường xuyên dựa trên feedback và thay đổi trong dự án.

