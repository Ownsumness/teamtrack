# TeamTrack Monorepo

This repository implements the reference architecture from `system-architecture.md` with a batteries-included monorepo. It provides:

- **Backend API (`apps/api`)** – NestJS + Fastify, Prisma ORM, PostgreSQL, Swagger docs and structured logging.
- **Frontend Web (`apps/web`)** – Next.js App Router, Tailwind CSS styling, React Query integration, and runtime calls to the API.
- **Background Worker (`apps/worker`)** – BullMQ-based queue processor backed by Redis with a demo job.

The repository uses npm workspaces so dependencies are isolated per app while sharing a single lockfile.

## Getting Started

1. Install dependencies from the repository root:

   ```bash
   npm install
   ```

2. Configure environment variables by copying the provided examples:

   ```bash
   cp apps/api/.env.example apps/api/.env
   cp apps/web/.env.example apps/web/.env
   cp apps/worker/.env.example apps/worker/.env
   ```

3. Make sure you have PostgreSQL and Redis running locally. Update the `.env` files if you use non-default credentials.

4. Generate the Prisma client and apply migrations:

   ```bash
   cd apps/api
   npx prisma migrate dev --name init
   cd ../..
   ```

5. Start the full stack (API + Web) from the repo root:

   ```bash
   npm run dev
   ```

   - API available at `http://localhost:3000` with Swagger docs under `/docs`.
   - Web app available at `http://localhost:3001` when started separately (see below). The combined `npm run dev` command runs both concurrently, keeping ports configurable.

6. (Optional) Start the worker to process BullMQ jobs:

   ```bash
   npm run dev:worker
   ```

### Running apps individually

- API only: `npm run dev:api`
- Web only: `npm run dev:web`
- Worker only: `npm run dev:worker`

### Linting and formatting

```bash
npm run lint    # runs lint for api and web
npm run format  # prettier across the monorepo
```

## Project Structure

```
repo/
├── apps/
│   ├── api/        # NestJS backend (REST API + Prisma)
│   ├── web/        # Next.js frontend (App Router)
│   └── worker/     # BullMQ worker for background jobs
├── package.json    # npm workspaces configuration
├── prettier.config.cjs
└── system-architecture.md
```

Each app contains its own `package.json`, TypeScript config, and environment sample file.

## Next Steps

- Flesh out domain modules (projects, tasks, orgs) following the modular NestJS pattern.
- Expand shared packages for DTOs/types if multi-app sharing increases.
- Add automated tests (unit + integration) and GitHub Actions CI as outlined in the architecture document.
