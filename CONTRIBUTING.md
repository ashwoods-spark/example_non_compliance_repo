# Contributing to AU Benefits Legacy Demo

Thank you for your interest in contributing! This is a demonstration project showcasing legacy system complexity and compliance drift.

## Development Setup

1. **Prerequisites**:
   - Node.js 20+
   - pnpm 8+
   - Docker & Docker Compose

2. **Installation**:
   ```bash
   corepack enable
   pnpm install
   docker compose up -d postgres redis
   pnpm prisma:generate
   pnpm prisma:migrate
   pnpm seed
   ```

3. **Running locally**:
   ```bash
   pnpm dev
   ```

## Project Structure

- `apps/` - Frontend and API gateway
- `services/` - Backend microservices
- `packages/` - Shared libraries
- `legislation/` - Legislative artifacts
- `docker/` - Container definitions
- `scripts/` - Utility scripts
- `docs/` - Documentation

## Code Style

- TypeScript strict mode enabled
- Prettier for formatting (run `pnpm format`)
- ESLint for linting (run `pnpm lint`)

## Testing

- Unit tests: `pnpm test`
- Typecheck: `pnpm typecheck`
- Legislation conformance: `pnpm test:legislation`

## Pull Request Process

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests and linting
5. Commit with descriptive messages
6. Push to your fork
7. Open a Pull Request

## Reporting Issues

When reporting bugs, please include:
- Steps to reproduce
- Expected behavior
- Actual behavior
- Environment details (OS, Node version, etc.)

## Questions?

Open an issue or discussion on GitHub.

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

