# Modern Web Application Monorepo (2025)

This repository implements a modern web application architecture with a Next.js 16 frontend, NestJS backend, Prisma ORM, Redis/BullMQ worker, and related configurations.

## Prerequisites
- Node.js 18 or higher
- PostgreSQL database
- Redis server
- Docker (optional, for containerized deployment)

## Setting up Backend API
1. Navigate to `apps/api`
2. Create `.env` file with environment variables:
  ```
  DATABASE_URL=postgresql://user:password@localhost:5432/dbname
  REDIS_URL=redis://localhost:6379
  ```

3. Install dependencies:
  ```bash
  npm install
  ```
4. Run Prisma migrations (for initial schema):
  ```bash
  npx prisma migrate dev --name init
  ```
5. Start development server:
  ```bash
  npm run start:dev
  ```

## Setting up Frontend Web
1. Navigate to `apps/web`
2. Install dependencies:
  ```bash
  npm install
  ```
3. Start development server:
  ```bash
  npm run dev
  ```

## Worker (background jobs)
*Not implemented in this minimal version but expected to be in `apps/worker`.*

## Docker
- Backend Dockerfile available at `apps/api/Dockerfile` for containerized deployment.

## Notes
- Swagger/OpenAPI support planned for backend API documentation.
- The code uses TypeScript, Prisma ORM, NestJS with Fastify, Next.js and Tailwind CSS.
- Deployment target is Kubernetes or PaaS platforms.

---

This minimal runnable example provides a foundation on which to build the full architecture detailed in the system document.