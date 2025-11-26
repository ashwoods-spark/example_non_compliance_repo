# AU Benefits Legacy Demo

A demonstration Australian government benefits platform implementing an excerpt of the Social Security Act 1991 (SSA1991). This repository showcases a realistic legacy system with a microservices architecture, including eligibility checking, benefit calculations, compliance scanning, and a modern React frontend.

## 🏗️ Architecture

This is a **TypeScript monorepo** using **pnpm workspaces** with the following structure:

### Frontend
- **apps/web**: React 18 + Vite + Tailwind + shadcn/ui (Deloitte AU green branding)

### Backend Services
- **apps/gateway**: API Gateway (Fastify, JWT auth)
- **services/svc-eligibility**: Age and residency eligibility checks
- **services/svc-benefits**: Benefit calculations, income caps, rounding
- **services/svc-compliance-engine**: Legislative rule management
- **services/svc-jobs**: Background jobs (BullMQ/Redis) for scan processing

### Shared Packages
- **packages/shared-types**: Zod schemas and TypeScript types
- **packages/shared-config**: Configuration management
- **packages/shared-db**: Prisma schema and database client

### Infrastructure
- **PostgreSQL** for persistent data (scans, findings, rulesets)
- **Redis** for job queues and caching
- **Docker Compose** for local development

## 📋 Legislation Artefacts

The system implements requirements from:
- `legislation/SSA1991_excerpt.md` - Human-readable summary
- `legislation/SSA1991_rules.json` - Machine-readable ruleset (v2)
- `legislation/CHANGELOG.md` - Legislative amendments

Key provisions:
- **s.35(2)**: Senior rate threshold at age 65
- **s.12(3)**: Minimum 10 months residency required
- **s.40**: Income cap of $85,000 with benefit reduction formula
- **Rounding**: round-half-up to 2 decimal places

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- pnpm 8+
- Docker & Docker Compose

### Installation

```bash
# Enable pnpm
corepack enable

# Install dependencies
pnpm install

# Start infrastructure services
docker compose up -d postgres redis

# Generate Prisma client
pnpm prisma:generate

# Run migrations
pnpm prisma:migrate

# Seed database with demo data
pnpm seed

# Start all services (dev mode)
pnpm dev
```

The following services will be available:
- Frontend: http://localhost:5173
- API Gateway: http://localhost:8080
- PostgreSQL: localhost:5432
- Redis: localhost:6379

### Login Credentials

```
Email: demo@example.com
Password: password123
```

## 🧪 Testing

```bash
# Run tests (current behavior)
pnpm test

# Run typecheck
pnpm typecheck

# Run legislation conformance tests (may fail)
pnpm test:legislation
```

The regular test suite validates current system behavior. The `test:legislation` script runs tests that compare implementation against the SSA1991 rules - these may reveal discrepancies.

## 📊 Features

### Compliance Scanning
- Create scans for code repositories
- Automatic detection of rule violations
- Detailed finding reports with rationale and recommendations
- File heatmaps showing areas of concern

### Ruleset Management
- Load rules from legislation artifacts
- Extract rules from uploaded policy documents
- Version tracking and diff generation
- Export to JSON, YAML, or plain text

### Dashboard & Analytics
- Scan status tracking
- Finding severity breakdown
- Coverage metrics
- Environment configuration display

## 🏃 Demo Script

1. **Login** at http://localhost:5173/login
2. **Dashboard** - View summary statistics
3. **Create a Scan** - Navigate to Scans → Create new scan
   - Use repository URL: `https://github.com/example/benefits-app`
   - Branch: `main`
4. **Watch Progress** - Scan status updates from queued → running → completed
5. **View Findings** - Click completed scan to see detected issues
   - Critical: Income cap discrepancy
   - High: Age threshold mismatch
   - High: Residency requirement stricter than legislated
   - Medium: Rounding method inconsistency
6. **Examine Details** - Click individual finding to see:
   - Legislative excerpt
   - Code location (file + lines)
   - Detailed rationale
   - Remediation recommendation
7. **Export Report** - Download findings as JSON or CSV
8. **Check Rulesets** - Navigate to Rulesets
   - View SSA1991 baseline ruleset
   - See version and rule count
9. **Settings** - View environment configuration

## 🗂️ Repository Structure

```
au-benefits-legacy-demo/
├── apps/
│   ├── gateway/           # API gateway (Fastify)
│   └── web/               # React frontend (Vite)
├── services/
│   ├── svc-eligibility/   # Eligibility service
│   ├── svc-benefits/      # Benefits calculation service
│   ├── svc-compliance-engine/  # Compliance rule engine
│   └── svc-jobs/          # Background job workers
├── packages/
│   ├── shared-types/      # Zod DTOs & TypeScript types
│   ├── shared-config/     # Config loader
│   └── shared-db/         # Prisma schema & client
├── legislation/           # SSA1991 excerpts & rules
├── docker/                # Dockerfiles
├── scripts/               # Seed & utility scripts
└── docs/                  # Additional documentation
```

## 🔧 Configuration

Key environment variables (see `.env.example` files):

```env
PORT=8080
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/benefits_db
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-secret-key

# Feature flags
USE_LEGACY_ROUNDING=true
ENABLE_COMPLIANCE_ENGINE=true

# Service URLs (for gateway)
SVC_ELIGIBILITY_URL=http://localhost:3001
SVC_BENEFITS_URL=http://localhost:3002
SVC_COMPLIANCE_URL=http://localhost:3003
```

## 🐳 Docker Compose

For a fully containerized setup:

```bash
# Build and start all services
docker compose up --build

# Run in detached mode
docker compose up -d

# View logs
docker compose logs -f

# Stop services
docker compose down
```

## 📚 API Documentation

The gateway exposes RESTful APIs:

### Authentication
- `POST /api/login` - Authenticate user

### Scans
- `POST /api/scans` - Create new scan
- `GET /api/scans` - List all scans
- `GET /api/scans/:id` - Get scan details
- `GET /api/scans/:id/heatmap` - Get file heatmap

### Findings
- `GET /api/findings/:id` - Get finding details

### Rulesets
- `GET /api/rulesets` - List rulesets
- `GET /api/rulesets/:id` - Get ruleset details
- `PUT /api/rulesets/:id` - Update ruleset
- `GET /api/rulesets/:id/diff` - Generate version diff
- `GET /api/rulesets/:id/export` - Export ruleset

### Reports
- `POST /api/reports/:id/export` - Export scan report

## 🤝 Contributing

This is a demonstration repository. For production use, consider:
- Proper authentication & authorization
- Input validation & sanitization
- Rate limiting & DDoS protection
- Comprehensive error handling
- Audit logging
- Security scanning
- Load testing

## 📝 License

MIT

## ⚠️ Disclaimer

This is a demonstration system for educational purposes. The legislative excerpts are simplified representations. For actual Social Security Act 1991 compliance, consult official Commonwealth legislation and legal experts.

