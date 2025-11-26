# Architecture Overview

## System Design

The AU Benefits Legacy Demo is a microservices-based system designed to simulate a realistic Australian government benefits platform with compliance scanning capabilities.

## Core Components

### 1. Frontend (apps/web)

**Technology**: React 18 + Vite + TypeScript + Tailwind CSS + React Router + Zustand

**Purpose**: Modern SPA providing user interface for compliance scanning, finding review, and ruleset management.

**Key Features**:
- Deloitte AU green branding (#86BC25)
- Light/dark theme support
- Real-time scan status updates
- Finding detail views with legislative context
- Export capabilities

**Pages**:
- `/login` - Authentication
- `/` - Dashboard with KPIs
- `/scans` - Scan list and creation
- `/scans/:id` - Scan detail with findings
- `/findings/:id` - Finding detail with recommendations
- `/rulesets` - Legislative ruleset management
- `/settings` - Configuration view

### 2. API Gateway (apps/gateway)

**Technology**: Fastify + JWT

**Purpose**: Single entry point for frontend, handles routing to microservices, authentication, and aggregation.

**Responsibilities**:
- Authentication/authorization (JWT)
- Request routing to backend services
- Response aggregation
- Rate limiting (production)
- CORS handling

**Endpoints**: See API documentation in README.md

### 3. Eligibility Service (services/svc-eligibility)

**Technology**: Fastify + TypeScript

**Purpose**: Determines eligibility based on age and residency requirements.

**Key Logic**:
- Age threshold checking (senior rate qualification)
- Residency period validation
- Date-based calculations

**Internal API**:
- `POST /internal/eligibility/check` - Check eligibility for given age and residency

### 4. Benefits Service (services/svc-benefits)

**Technology**: Fastify + TypeScript

**Purpose**: Calculates benefit amounts including income-based reductions.

**Key Logic**:
- Income threshold evaluation
- Benefit reduction formula (Section 40A)
- Monetary rounding (configurable)

**Internal API**:
- `POST /internal/benefits/calc` - Calculate benefit amount

### 5. Compliance Engine (services/svc-compliance-engine)

**Technology**: Fastify + TypeScript + Prisma

**Purpose**: Manages legislative rulesets, parses legislation artifacts, generates rule diffs.

**Key Logic**:
- Load rules from `legislation/SSA1991_rules.json`
- Extract rules from uploaded documents (mock)
- Version comparison and diff generation
- Rule export (JSON/YAML/plaintext)

**Internal API**:
- `GET /internal/legislation/rules` - Get current legislation rules
- `POST /internal/rulesets/fromUpload` - Create ruleset from upload
- `GET /internal/rulesets/:id/diff` - Generate version diff

### 6. Job Worker (services/svc-jobs)

**Technology**: BullMQ + Redis + Prisma

**Purpose**: Background processing for scan jobs, finding generation.

**Key Logic**:
- Poll scan queue (BullMQ)
- Process repository scan (simulated)
- Generate findings based on code analysis (mock)
- Update scan status and findings in database

**Job Types**:
- `scan-repo` - Full repository compliance scan

### 7. Shared Database (packages/shared-db)

**Technology**: Prisma + PostgreSQL

**Schema**:
- `Scan` - Scan records with status tracking
- `Finding` - Compliance findings linked to scans
- `Ruleset` - Legislative rule collections
- `Rule` - Individual rules within rulesets
- `Upload` - Document uploads for rule extraction
- `Report` - Generated reports

**Migrations**: Located in `packages/shared-db/prisma/migrations/`

### 8. Shared Types (packages/shared-types)

**Technology**: Zod + TypeScript

**Purpose**: Type-safe DTOs shared across frontend and backend.

**Key Schemas**:
- Request/response validation
- Data transfer objects
- OpenAPI generation-ready

### 9. Shared Config (packages/shared-config)

**Technology**: dotenv + Node.js

**Purpose**: Centralized configuration management.

**Features**:
- Environment variable loading
- JSON config file support
- Feature flags
- Type-safe config objects

## Data Flow

### 1. Scan Creation Flow

```
User (Frontend)
  → POST /api/scans (Gateway)
  → Create Scan record (Prisma)
  → Enqueue job (BullMQ/Redis)
  → Return scan to user

Background Worker
  → Poll queue
  → Process scan (simulated analysis)
  → Generate findings
  → Store findings (Prisma)
  → Update scan status
```

### 2. Finding Review Flow

```
User (Frontend)
  → GET /api/scans/:id (Gateway)
  → Fetch scan + findings (Prisma)
  → Return to user

User clicks finding
  → GET /api/findings/:id (Gateway)
  → Fetch finding detail (Prisma)
  → Return with law excerpt, rationale, recommendation
```

### 3. Eligibility Check Flow

```
External System/User
  → POST /api/eligibility (Gateway)
  → POST /internal/eligibility/check (svc-eligibility)
  → Check age threshold
  → Check residency months
  → Return eligibility result
```

## Configuration Sources

The system intentionally has **multiple configuration sources** to simulate legacy drift:

1. **Legislation artifacts** (`legislation/SSA1991_rules.json`) - Ground truth
2. **Service configs** (`services/svc-benefits/src/config/thresholds.json`)
3. **Gateway defaults** (`apps/gateway/config/defaults.json`)
4. **Environment variables** (`.env` files)
5. **Hard-coded values** (scattered through code)

This creates realistic inconsistencies that the compliance scanner detects.

## Deployment Considerations

### Local Development
- Use `pnpm dev` to run all services concurrently
- PostgreSQL and Redis via Docker Compose
- Hot reload enabled for all services

### Production (Recommendations)
- Container orchestration (Kubernetes/ECS)
- Managed PostgreSQL (RDS)
- Managed Redis (ElastiCache)
- Secret management (Vault/AWS Secrets Manager)
- API Gateway with rate limiting
- Load balancing across service replicas
- Centralized logging (ELK/CloudWatch)
- Monitoring (Prometheus/Grafana)
- CI/CD pipeline (GitHub Actions)

## Security Notes

**Current State** (Demo):
- Mock JWT authentication
- No rate limiting
- Minimal input validation
- No audit logging

**Production Requirements**:
- OAuth2/OIDC integration
- API rate limiting & throttling
- Comprehensive input validation
- SQL injection prevention (Prisma helps)
- XSS prevention (React helps)
- CSRF protection
- Audit trail for all operations
- Security headers (Helmet)
- TLS/HTTPS everywhere
- Secret rotation
- Penetration testing

## Scalability

**Current Bottlenecks**:
- Single PostgreSQL instance
- Single Redis instance
- No caching layer
- Synchronous job processing

**Scaling Strategies**:
- Read replicas for PostgreSQL
- Redis cluster/Sentinel
- CDN for frontend
- Service replication (horizontal scaling)
- Async messaging (Kafka/SQS)
- Caching layer (Redis/Memcached)
- Database sharding (if needed)

## Testing Strategy

**Unit Tests**: Each service has unit tests for core logic
**Integration Tests**: API endpoint tests with test database
**E2E Tests**: Playwright for critical user journeys (not included in this demo)
**Legislation Tests**: Optional tests that verify against legislation requirements

## Monitoring & Observability

**Recommended Additions**:
- Distributed tracing (Jaeger/X-Ray)
- Structured logging (Winston/Pino)
- Metrics collection (Prometheus)
- Health check endpoints (already included)
- Alerting (PagerDuty/Opsgenie)
- Performance monitoring (New Relic/DataDog)

