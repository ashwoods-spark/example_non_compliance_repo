# Changelog

All notable changes to this project will be documented in this file.

## [1.0.0] - 2024-01-01

### Added
- Initial release of AU Benefits Legacy Demo
- React frontend with Deloitte AU branding
- API Gateway with Fastify
- Eligibility service (age and residency checks)
- Benefits service (income-based calculations)
- Compliance engine (legislative rule management)
- Background job processing with BullMQ
- PostgreSQL database with Prisma ORM
- Redis for job queue and caching
- Docker Compose for local development
- Seed data with realistic scan/finding examples
- Comprehensive documentation (README, architecture, demo script)
- GitHub Actions CI workflow
- Legislation artifacts (SSA1991 excerpt, rules, changelog)

### Intentional Mismatches (Demo)
- Age threshold: Code uses 70, legislation specifies 65
- Residency requirement: Code enforces 12 months, legislation requires 10
- Income cap: Multiple values (90k, 88k, 92k) vs. legislated 85k
- Rounding method: Code uses floor(), legislation requires round-half-up
- UI copy: Stale references to 12-month residency
- Date calculations: Simplified month counting with drift

### Known Limitations
- Mock authentication (JWT stub)
- Simulated scan processing (not real code analysis)
- No rate limiting
- Limited error handling
- Demo-level security only

## Future Enhancements (Not Implemented)

- Real AST-based code analysis
- OAuth2/OIDC authentication
- Automated PR generation for fixes
- Advanced diff visualization
- Performance optimizations
- Multi-tenancy support
- Audit logging
- Advanced reporting/dashboards

