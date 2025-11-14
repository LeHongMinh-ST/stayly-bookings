.PHONY: help setup install start stop restart logs clean test lint build docker-build docker-up docker-down docker-logs docker-clean db-migrate db-seed db-reset kafka-topics kafka-consume kafka-produce start-debug docker-up-api docker-up-tools docker-restart docker-logs-api docker-logs-postgres docker-logs-redis docker-logs-kafka docker-ps docker-build info status format test-watch test-cov test-e2e clean-all redis-connect redis-flush kafka-topic-create kafka-topic-describe kafka-topic-delete kafka-produce kafka-consume db-connect db-migrate-revert db-backup db-restore

# Colors for output
GREEN  := $(shell tput -Txterm setaf 2)
YELLOW := $(shell tput -Txterm setaf 3)
RESET  := $(shell tput -Txterm sgr0)

# Detect Docker Compose command (v2 uses 'docker compose', v1 uses 'docker-compose')
# Try 'docker compose' first (v2), fallback to 'docker-compose' (v1)
DOCKER_COMPOSE := $(shell if docker compose version > /dev/null 2>&1; then echo "docker compose"; elif which docker-compose > /dev/null 2>&1; then echo "docker-compose"; else echo "docker compose"; fi)

# Default target
.DEFAULT_GOAL := help

##@ General

help: ## Display this help message
	@echo "$(GREEN)Available commands:$(RESET)"
	@awk 'BEGIN {FS = ":.*##"; printf "\n"} /^[a-zA-Z_-]+:.*?##/ { printf "  $(YELLOW)%-20s$(RESET) %s\n", $$1, $$2 } /^##@/ { printf "\n$(GREEN)%s$(RESET)\n", substr($$0, 5) } ' $(MAKEFILE_LIST)

##@ Setup

setup: install docker-up ## Complete setup: install dependencies and start Docker services
	@echo "$(GREEN)✓ Setup completed!$(RESET)"
	@echo "$(YELLOW)Next steps:$(RESET)"
	@echo "  1. Copy .env.example to .env in api-stayly directory"
	@echo "  2. Update environment variables in .env file"
	@echo "  3. Run 'make db-migrate' to setup database"
	@echo "  4. Run 'make start' to start backend server"

install: ## Install backend dependencies
	@echo "$(GREEN)Installing backend dependencies...$(RESET)"
	cd api-stayly && pnpm install
	cd app-stayly && pnpm install

##@ Docker

docker-up: ## Start Docker services (PostgreSQL, Redis, Kafka)
	@echo "$(GREEN)Starting Docker services...$(RESET)"
	$(DOCKER_COMPOSE) up -d postgres redis zookeeper kafka
	@echo "$(GREEN)Waiting for services to be ready...$(RESET)"
	@sleep 5
	@echo "$(GREEN)✓ Docker services started!$(RESET)"

docker-up-api: docker-up ## Start Docker services including backend API
	@echo "$(GREEN)Starting backend API in Docker...$(RESET)"
	$(DOCKER_COMPOSE) --profile api up -d api
	@echo "$(GREEN)✓ Backend API started!$(RESET)"

docker-up-tools: docker-up ## Start Docker services including Kafka UI
	@echo "$(GREEN)Starting Kafka UI...$(RESET)"
	$(DOCKER_COMPOSE) --profile tools up -d kafka-ui
	@echo "$(GREEN)✓ Kafka UI started at http://localhost:8080$(RESET)"

docker-down: ## Stop Docker services
	@echo "$(YELLOW)Stopping Docker services...$(RESET)"
	$(DOCKER_COMPOSE) down
	@echo "$(GREEN)✓ Docker services stopped!$(RESET)"

docker-restart: docker-down docker-up ## Restart Docker services
	@echo "$(GREEN)✓ Docker services restarted!$(RESET)"

docker-logs: ## View Docker services logs
	$(DOCKER_COMPOSE) logs -f

docker-logs-api: ## View backend API logs
	$(DOCKER_COMPOSE) logs -f api

docker-logs-postgres: ## View PostgreSQL logs
	$(DOCKER_COMPOSE) logs -f postgres

docker-logs-redis: ## View Redis logs
	$(DOCKER_COMPOSE) logs -f redis

docker-logs-kafka: ## View Kafka logs
	$(DOCKER_COMPOSE) logs -f kafka

docker-ps: ## Show Docker services status
	$(DOCKER_COMPOSE) ps

docker-clean: docker-down ## Stop and remove Docker containers, networks, and volumes (⚠️ deletes data)
	@echo "$(YELLOW)Removing volumes...$(RESET)"
	$(DOCKER_COMPOSE) down -v
	@echo "$(GREEN)✓ Docker cleanup completed!$(RESET)"

docker-build: ## Build backend Docker image
	@echo "$(GREEN)Building backend Docker image...$(RESET)"
	cd api-stayly && docker build -t stayly-api:latest .
	@echo "$(GREEN)✓ Docker image built!$(RESET)"

##@ Development

start: ## Start backend development server (local)
	@echo "$(GREEN)Starting backend development server...$(RESET)"
	cd api-stayly && pnpm start:dev

start-debug: ## Start backend in debug mode
	@echo "$(GREEN)Starting backend in debug mode...$(RESET)"
	cd api-stayly && pnpm start:debug

stop: ## Stop backend server (if running in background)
	@echo "$(YELLOW)Stopping backend server...$(RESET)"
	@pkill -f "nest start" || true
	@echo "$(GREEN)✓ Backend server stopped!$(RESET)"

start-fe: ## Start frontend development server (local)
	@echo "$(GREEN)Starting frontend development server...$(RESET)"
	cd app-stayly && pnpm dev

stop-fe: ## Stop frontend server (if running in background)
	@echo "$(YELLOW)Stopping frontend server...$(RESET)"
	@pkill -f "pnpm dev" || true
	@echo "$(GREEN)✓ Frontend server stopped!$(RESET)"

restart: stop start ## Restart backend server

##@ Database

db-connect: ## Connect to PostgreSQL database
	@echo "$(GREEN)Connecting to PostgreSQL...$(RESET)"
	$(DOCKER_COMPOSE) exec postgres psql -U ${POSTGRES_USER:-stayly_user} -d ${POSTGRES_DB:-stayly_db}

db-migrate: ## Run database migrations
	@echo "$(GREEN)Running database migrations...$(RESET)"
	cd api-stayly && pnpm migration:run || echo "$(YELLOW)Migration command not found. Make sure TypeORM is configured.$(RESET)"

db-migrate-revert: ## Revert last database migration
	@echo "$(YELLOW)Reverting last migration...$(RESET)"
	cd api-stayly && pnpm migration:revert || echo "$(YELLOW)Migration revert command not found.$(RESET)"

db-seed: ## Seed database with initial data
	@echo "$(GREEN)Seeding database...$(RESET)"
	cd api-stayly && pnpm seed || echo "$(YELLOW)Seed command not found.$(RESET)"

db-reset: ## Reset database (⚠️ deletes all data)
	@echo "$(YELLOW)⚠️  This will delete all database data!$(RESET)"
	@read -p "Are you sure? [y/N] " -n 1 -r; \
	echo; \
	if [[ $$REPLY =~ ^[Yy]$$ ]]; then \
		echo "$(GREEN)Resetting database...$(RESET)"; \
		$(DOCKER_COMPOSE) exec postgres psql -U ${POSTGRES_USER:-stayly_user} -d ${POSTGRES_DB:-stayly_db} -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"; \
		$(MAKE) db-migrate; \
		$(MAKE) db-seed; \
		echo "$(GREEN)✓ Database reset completed!$(RESET)"; \
	fi

db-backup: ## Backup database
	@echo "$(GREEN)Backing up database...$(RESET)"
	@mkdir -p backups
	$(DOCKER_COMPOSE) exec -T postgres pg_dump -U ${POSTGRES_USER:-stayly_user} ${POSTGRES_DB:-stayly_db} > backups/backup_$$(date +%Y%m%d_%H%M%S).sql
	@echo "$(GREEN)✓ Backup saved to backups/ directory$(RESET)"

db-restore: ## Restore database from backup (usage: make db-restore FILE=backups/backup.sql)
	@if [ -z "$(FILE)" ]; then \
		echo "$(YELLOW)Usage: make db-restore FILE=backups/backup.sql$(RESET)"; \
		exit 1; \
	fi
	@echo "$(GREEN)Restoring database from $(FILE)...$(RESET)"
	$(DOCKER_COMPOSE) exec -T postgres psql -U ${POSTGRES_USER:-stayly_user} -d ${POSTGRES_DB:-stayly_db} < $(FILE)
	@echo "$(GREEN)✓ Database restored!$(RESET)"

##@ Redis

redis-connect: ## Connect to Redis CLI
	@echo "$(GREEN)Connecting to Redis...$(RESET)"
	$(DOCKER_COMPOSE) exec redis redis-cli

redis-flush: ## Flush all Redis data (⚠️ deletes all cache)
	@echo "$(YELLOW)⚠️  This will delete all Redis data!$(RESET)"
	@read -p "Are you sure? [y/N] " -n 1 -r; \
	echo; \
	if [[ $$REPLY =~ ^[Yy]$$ ]]; then \
		$(DOCKER_COMPOSE) exec redis redis-cli FLUSHALL; \
		echo "$(GREEN)✓ Redis data flushed!$(RESET)"; \
	fi

##@ Kafka

kafka-topics: ## List all Kafka topics
	@echo "$(GREEN)Listing Kafka topics...$(RESET)"
	$(DOCKER_COMPOSE) exec kafka kafka-topics --bootstrap-server localhost:9092 --list

kafka-topic-create: ## Create Kafka topic (usage: make kafka-topic-create TOPIC=booking.created PARTITIONS=3)
	@if [ -z "$(TOPIC)" ]; then \
		echo "$(YELLOW)Usage: make kafka-topic-create TOPIC=booking.created PARTITIONS=3$(RESET)"; \
		exit 1; \
	fi
	@echo "$(GREEN)Creating Kafka topic $(TOPIC)...$(RESET)"
	$(DOCKER_COMPOSE) exec kafka kafka-topics --bootstrap-server localhost:9092 --create --topic $(TOPIC) --partitions ${PARTITIONS:-3} --replication-factor 1
	@echo "$(GREEN)✓ Topic created!$(RESET)"

kafka-topic-describe: ## Describe Kafka topic (usage: make kafka-topic-describe TOPIC=booking.created)
	@if [ -z "$(TOPIC)" ]; then \
		echo "$(YELLOW)Usage: make kafka-topic-describe TOPIC=booking.created$(RESET)"; \
		exit 1; \
	fi
	$(DOCKER_COMPOSE) exec kafka kafka-topics --bootstrap-server localhost:9092 --describe --topic $(TOPIC)

kafka-topic-delete: ## Delete Kafka topic (usage: make kafka-topic-delete TOPIC=booking.created)
	@if [ -z "$(TOPIC)" ]; then \
		echo "$(YELLOW)Usage: make kafka-topic-delete TOPIC=booking.created$(RESET)"; \
		exit 1; \
	fi
	@echo "$(YELLOW)⚠️  This will delete the topic $(TOPIC)!$(RESET)"
	@read -p "Are you sure? [y/N] " -n 1 -r; \
	echo; \
	if [[ $$REPLY =~ ^[Yy]$$ ]]; then \
		$(DOCKER_COMPOSE) exec kafka kafka-topics --bootstrap-server localhost:9092 --delete --topic $(TOPIC); \
		echo "$(GREEN)✓ Topic deleted!$(RESET)"; \
	fi

kafka-consume: ## Consume messages from Kafka topic (usage: make kafka-consume TOPIC=booking.created)
	@if [ -z "$(TOPIC)" ]; then \
		echo "$(YELLOW)Usage: make kafka-consume TOPIC=booking.created$(RESET)"; \
		exit 1; \
	fi
	@echo "$(GREEN)Consuming messages from $(TOPIC)...$(RESET)"
	$(DOCKER_COMPOSE) exec kafka kafka-console-consumer --bootstrap-server localhost:9092 --topic $(TOPIC) --from-beginning

kafka-produce: ## Produce messages to Kafka topic (usage: make kafka-produce TOPIC=booking.created)
	@if [ -z "$(TOPIC)" ]; then \
		echo "$(YELLOW)Usage: make kafka-produce TOPIC=booking.created$(RESET)"; \
		exit 1; \
	fi
	@echo "$(GREEN)Producing messages to $(TOPIC)...$(RESET)"
	$(DOCKER_COMPOSE) exec -it kafka kafka-console-producer --bootstrap-server localhost:9092 --topic $(TOPIC)

##@ Testing

test: ## Run backend tests
	@echo "$(GREEN)Running tests...$(RESET)"
	cd api-stayly && pnpm test

test-watch: ## Run tests in watch mode
	cd api-stayly && pnpm test:watch

test-cov: ## Run tests with coverage
	@echo "$(GREEN)Running tests with coverage...$(RESET)"
	cd api-stayly && pnpm test:cov

test-e2e: ## Run E2E tests
	@echo "$(GREEN)Running E2E tests...$(RESET)"
	cd api-stayly && pnpm test:e2e

##@ Code Quality

lint: ## Lint backend code
	@echo "$(GREEN)Linting code...$(RESET)"
	cd api-stayly && pnpm lint

format: ## Format backend code
	@echo "$(GREEN)Formatting code...$(RESET)"
	cd api-stayly && pnpm format

##@ Build

build: ## Build backend for production
	@echo "$(GREEN)Building backend...$(RESET)"
	cd api-stayly && pnpm build
	@echo "$(GREEN)✓ Build completed!$(RESET)"

##@ Cleanup

clean: ## Clean build artifacts and node_modules
	@echo "$(YELLOW)Cleaning build artifacts...$(RESET)"
	cd api-stayly && rm -rf dist node_modules coverage
	@echo "$(GREEN)✓ Clean completed!$(RESET)"

clean-all: clean docker-clean ## Clean everything including Docker volumes (⚠️ deletes all data)
	@echo "$(GREEN)✓ Full cleanup completed!$(RESET)"

##@ Information

status: ## Show status of all services
	@echo "$(GREEN)=== Docker Services Status ===$(RESET)"
	@$(DOCKER_COMPOSE) ps
	@echo ""
	@echo "$(GREEN)=== Backend Process ===$(RESET)"
	@pgrep -f "nest start" > /dev/null && echo "$(GREEN)✓ Backend is running$(RESET)" || echo "$(YELLOW)✗ Backend is not running$(RESET)"
	@echo ""
	@echo "$(GREEN)=== Service URLs ===$(RESET)"
	@echo "  Backend API:    http://localhost:3000"
	@echo "  PostgreSQL:     localhost:5433"
	@echo "  Redis:          localhost:6379"
	@echo "  Kafka:          localhost:9092"
	@echo "  Kafka UI:       http://localhost:8080"

info: ## Show project information
	@echo "$(GREEN)=== Project Information ===$(RESET)"
	@echo "  Project: Stayly Bookings"
	@echo "  Backend: NestJS"
	@echo "  Frontend: Next.js"
	@echo "  Database: PostgreSQL"
	@echo "  Cache: Redis"
	@echo "  Message Queue: Kafka"
	@echo ""
	@echo "$(GREEN)=== Quick Start ===$(RESET)"
	@echo "  1. make setup          - Complete setup"
	@echo "  2. make start          - Start backend"
	@echo "  3. make status         - Check status"
	@echo ""
	@echo "$(GREEN)=== Documentation ===$(RESET)"
	@echo "  See README.md for detailed instructions"

