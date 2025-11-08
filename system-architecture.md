# General Web Application System Architecture (2025)

This document describes a practical, scalable, and maintainable architecture for a modern web application. It targets a wide range of business apps (SaaS, internal tools, consumer portals) and emphasizes developer productivity, security, and operational excellence.

It includes recommended frameworks/libraries, code structure for backend and frontend, API design, and deployment strategy. Each major decision includes pros and cons.


## 1) Goals and Non-Goals

Goals:
- Fast developer iteration with a Typescript-first stack and strong typing across the boundary.
- Modular, testable, and maintainable architecture that starts as a modular monolith and can evolve to services.
- Secure by default: robust authN/authZ, input validation, dependency hygiene, and secrets management.
- Observability from day one: logs, metrics, traces; health and readiness checks.
- Cloud-ready: containerized, infra-as-code, CI/CD, multi-environment, and scalable horizontally.
- Cost-aware defaults: managed database, autoscaling, CDN, and caching.

Non-Goals:
- Domain-specific data model or specialized business logic.
- Hard requirements for a single cloud vendor or PaaS; we present options.


## 2) High-Level Architecture Overview

- Frontend: Next.js 16 (React 19) for SSR/SSG/ISR and hybrid rendering, deployed behind a CDN.
- Backend API: Node.js 24 LTS (Krypton) with NestJS, exposing a versioned REST API (OpenAPI 3.1). Optional GraphQL or tRPC layer if needed later.
- Database: PostgreSQL (managed) with Prisma ORM and migrations.
- Caching: Redis for ephemeral caching, sessions (if needed), and queues (BullMQ) for background jobs.
- Messaging: Start with Redis-backed BullMQ for jobs; graduate to RabbitMQ/Kafka for high-throughput eventing if needed.
- Object Storage: S3-compatible (AWS S3/MinIO) for files and media.
- Search (optional): OpenSearch/Elasticsearch when advanced search required.
- Observability: OpenTelemetry for traces/metrics; Pino logs; Prometheus/Grafana; Tempo/Jaeger for traces; Loki/ELK for logs.
- Security: OIDC (Auth0/Okta/Keycloak) with JWT access tokens; rate limiting; request validation; CSP and security headers; secrets via cloud KMS/manager.
- Deployment: Containerized, orchestrated by Kubernetes (or PaaS alternative). Frontend may be on Vercel/Netlify + CDN. CI/CD via GitHub Actions.


## 3) Tech Stack Recommendations (with Pros/Cons)

Backend:
- Runtime: Node.js 24 LTS
  - Pros: Long-term support, strong TS ecosystem, broad community, modern diagnostics/perf improvements. Current LTS as of 2025.
  - Cons: Single-threaded event loop; CPU-heavy tasks need workers or offloading.
- Framework: NestJS (with Fastify adapter)
  - Pros: Opinionated modular architecture, DI, decorators, guards, interceptors; easy testing; scales well; Fastify offers better perf than Express.
  - Cons: Learning curve; decorator-heavy style; more ceremony than minimalist frameworks.
- ORM: Prisma
  - Pros: Great DX, type-safe client, migration tooling, schema-as-source-of-truth; works well with Postgres.
  - Cons: Some advanced SQL features require raw queries; Prisma client size for lambdas may need care.
- Validation/Serialization: Zod or class-validator/class-transformer
  - Pros (Zod): Isomorphic schemas reused on client; great DX; zod-to-openapi possible.
  - Cons: class-validator integrates tightly with Nest’s pipes; choose one consistently.
- Auth: OIDC (Auth0/Okta/Cognito/Keycloak) + JWT; Nest Passport strategies
  - Pros: Standards-based; supports SSO; external IdP simplifies security.
  - Cons: Vendor cost/lock-in (managed IdP); self-hosted Keycloak requires ops effort.
- Caching/Jobs: Redis + BullMQ
  - Pros: Simple to start, resilient queues, repeatable jobs, rate limiting.
  - Cons: For very high scale/event streaming, Kafka/RabbitMQ may be needed.
- Documentation: OpenAPI 3.1 via @nestjs/swagger or zod-to-openapi
  - Pros: Contract-first/verified; supports client generation.
  - Cons: Keep schemas in sync; requires discipline.

Frontend:
- Framework: Next.js 16 (React 19)
  - Pros: Hybrid rendering (SSR/SSG/ISR/RSC), great routing, built-in performance; strong ecosystem. React 19 features stable.
  - Cons: Server Components learning curve; vendor coupling if using Vercel features heavily.
- Language/Tooling: TypeScript, ESLint, Prettier, SWC/Turbopack
- Styling: Tailwind CSS + Radix UI primitives (+ shadcn/ui if desired)
  - Pros: Rapid UI development, consistent design tokens; accessible components via Radix.
  - Cons: Tailwind utility-first style may not appeal to everyone.
- State/Data Fetching: TanStack Query for server state; Zustand or Context for local state
  - Pros: Great cache, revalidation, de-duping; predictable mental model.
  - Cons: Requires clear separation of server vs UI state.
- Forms: React Hook Form + Zod resolver
  - Pros: High perf, minimal re-renders, shared validation schemas.
  - Cons: Schema drift risk if not centralized.
- i18n: next-intl or next-i18next
- Analytics/Telemetry: first-party analytics (e.g., Plausible) or privacy-friendly alternative; web-vitals capture.

Infrastructure/DevX:
- Containers: Docker + multi-stage builds; distroless base images for security.
- Orchestration: Kubernetes (AKS/EKS/GKE) or PaaS (Fly.io/Render/Heroku) for simpler ops; Vercel for frontend.
- IaC: Terraform + Helm/Kustomize; SOPS or cloud KMS for secrets.
- CI/CD: GitHub Actions; Trivy/Snyk for scanning; Renovate for deps.
- Observability: OpenTelemetry SDK; Grafana stack (Loki/Tempo/Prometheus) or vendor (Datadog/New Relic).


## 4) Monorepo Structure (Optional but Recommended)

Use pnpm workspaces or Turborepo for shared types, schemas, configs.

repo/
- apps/
  - web/           Next.js app (frontend)
  - api/           NestJS app (backend)
  - worker/        Background job runner (NestJS or vanilla Node)
- packages/
  - shared-types/  Shared TypeScript types (DTOs, Zod schemas)
  - ui/            Shared UI components (if multiple apps)
  - config/        Shared ESLint, tsconfig, prettier configs
  - api-client/    Generated API client from OpenAPI (fetch wrapper)
- infra/
  - terraform/     IaC modules and env stacks
  - k8s/           Helm charts or Kustomize overlays
- .github/workflows/ CI pipelines

Pros:
- Single source of truth for types/schemas; easier refactors.
- Atomic changes across apps; faster onboarding.
Cons:
- Needs tooling discipline; repo size can grow; PRs can be large.


## 5) Backend Architecture and Structure

Paradigm: Modular monolith with clear domain boundaries; ports-and-adapters ideas to simplify later extraction.

NestJS module layout example (apps/api):
- src/
  - main.ts               Bootstrap with Fastify, validation, OpenAPI
  - app.module.ts
  - config/               Config module, env validation (zod)
  - common/               Interceptors, guards, filters, decorators, pipes
  - auth/                 OIDC login, JWT verification, guards, RBAC policies
  - users/                Users module (controller/service/repo/entity/dto)
  - orgs/                 Organizations/tenancy
  - projects/             Business domain example
  - tasks/                Business domain example
  - files/                S3 integration, uploads, signed URLs
  - notifications/        Email/SMS/push providers (queue-backed)
  - webhooks/             Outgoing and incoming webhook handlers
  - search/               OpenSearch integration (optional)
  - jobs/                 BullMQ queues, processors, schedulers
  - observability/        OpenTelemetry, metrics, health checks
  - database/             Prisma client, migrations scripts
  - test/                 Integration/e2e tests

Key patterns:
- DTOs and validation with Zod or class-validator; map to domain entities.
- Services contain business logic; repositories handle persistence via Prisma.
- Domain events published internally (in-memory) and optionally to a queue.
- HTTP concerns in controllers; no business logic in controllers.
- Config typed and validated at startup; no unvalidated env vars.
- Errors standardized via an error filter returning a uniform problem+json shape.

Error format (example):
{
  "type": "https://docs.example.com/errors/validation",
  "title": "Validation Failed",
  "status": 422,
  "traceId": "01HE...",
  "errors": [{ "field": "email", "message": "Invalid email" }]
}

Security:
- OIDC JWT verification via JWKS; short-lived access tokens, refresh in frontend using secure cookies.
- RBAC/ABAC authorization guards; per-tenant scoping.
- Input validation everywhere; output serialization; avoid leaking internals.
- Rate limiting per IP and per user (e.g., fastify-rate-limit or gateway-level).
- Secrets via mounted files or env with rotation; do not log secrets/PII.

Database:
- PostgreSQL with Prisma; use Prisma migrate for schema changes.
- Tenancy model:
  - Default: single DB with tenant_id column and RLS (Row Level Security) if feasible.
  - Alternative: schema-per-tenant for larger tenants.
- Backups: nightly full + PITR; test restores; document RPO/RTO.

Caching/Performance:
- Redis for:
  - Cache: key patterns with TTL and cache invalidation hooks.
  - Locks: distributed locks for critical sections.
  - Rate limiting counters.
- HTTP caching: ETag/Last-Modified; Cache-Control; CDN caching for GET endpoints when appropriate.

Background Jobs:
- BullMQ with named queues: email, search-indexing, thumbnails, billing, etc.
- Observability: dashboard and dead-letter queues; retries with backoff; idempotency keys.

File Handling:
- Direct-to-S3 uploads with pre-signed URLs; virus scan optional via Lambda/ClamAV; store metadata in DB.

Observability:
- OpenTelemetry SDK with OTLP exporter; trace context propagation; logs include traceId/spanId.
- Pino for JSON logs
- Prometheus metrics endpoints: /metrics; RED metrics and custom business KPIs.
- Health endpoints: /healthz (liveness), /readyz (readiness), /startupz.

Testing:
- Unit: Vitest/Jest for services and utilities.
- Integration: Testcontainers to spin Postgres/Redis; Prisma test DB per run.
- API e2e: Supertest against Nest app; seed data via factories.
- Contract: OpenAPI validation; optional Pact for provider/consumer tests.


## 6) Frontend Architecture and Structure

Next.js 16 with the App Router and React Server Components (RSC) where appropriate.

Structure (apps/web):
- app/
  - (routes)/            Route groups with server components by default
  - api/                 Route handlers (if needed for edge or simple proxies)
  - layout.tsx, page.tsx
  - error.tsx, loading.tsx, not-found.tsx
- components/
  - ui/                  Radix + Tailwind components
  - forms/               Reusable form components with RHF + Zod
- lib/
  - api-client.ts        Typed API client (generated or hand-written wrapper)
  - auth.ts              Session handling, token refresh, SSR helpers
  - analytics.ts         Web vitals and event tracking
- styles/
  - globals.css, tailwind.css
- hooks/
- i18n/
- tests/

Data fetching:
- Prefer server components for data-heavy pages; stream where beneficial.
- Client components for interactive parts; use TanStack Query for client-side fetching/mutations.
- Shared Zod schemas for validation and type safety; infer client types from backend schemas where possible.

State management:
- Server state via TanStack Query; UI state via Zustand/Context.
- Avoid global stores for everything; keep state close to components.

Performance:
- Use Next Image for optimization; font optimization; route-level caching; ISR for marketing/content pages; stale-while-revalidate.
- Bundle analysis; avoid client-side JS bloat; strict module boundaries.

Security/accessibility:
- Use HTTP-only secure cookies for tokens when possible; CSRF protection for state-changing requests if using cookies.
- CSP, XSS protection, sanitize HTML; escape dangerous content.
- WCAG 2.1 AA; use semantic HTML and aria attributes; test with axe.

Testing:
- Unit/component: Vitest + Testing Library.
- E2E: Playwright/Cypress against deployed preview environments.


## 7) API Design

Style: Versioned REST with OpenAPI 3.1, JSON over HTTPS. Consistent resource naming, nouns, plural.

Conventions:
- Base URL: https://api.example.com/v1
- Auth: Bearer JWT in Authorization header; optional mTLS for service-to-service.
- Idempotency-Key header for POST endpoints that create resources.
- Pagination: cursor-based by default (limit, cursor); fall back to page/size for simple lists.
- Filtering: standardized query syntax (e.g., filter[field]=value, sort=-createdAt).
- Errors: application/problem+json as shown above.
- Rate limits: standard 429 with Retry-After; return X-RateLimit-* headers.
- Correlation ID: request ID in headers (X-Request-Id) and propagated; include in logs and responses.

Key endpoints (typical app):
- Auth
  - POST /v1/auth/login (if first-party) or OIDC callback endpoints
  - POST /v1/auth/refresh
  - POST /v1/auth/logout
- Users
  - GET /v1/users/me
  - PATCH /v1/users/me
  - GET /v1/users?filter[orgId]=...&limit=...
  - POST /v1/users
  - GET /v1/users/{id}
  - PATCH /v1/users/{id}
  - DELETE /v1/users/{id}
- Organizations
  - GET /v1/orgs
  - POST /v1/orgs
  - GET /v1/orgs/{id}
  - PATCH /v1/orgs/{id}
  - DELETE /v1/orgs/{id}
  - POST /v1/orgs/{id}/invites
- Projects
  - GET /v1/projects?filter[orgId]=...&cursor=...
  - POST /v1/projects
  - GET /v1/projects/{id}
  - PATCH /v1/projects/{id}
  - DELETE /v1/projects/{id}
- Tasks
  - GET /v1/tasks?filter[projectId]=...&status=open
  - POST /v1/tasks
  - GET /v1/tasks/{id}
  - PATCH /v1/tasks/{id}
  - DELETE /v1/tasks/{id}
- Files
  - POST /v1/files/uploads (returns pre-signed URL)
  - GET /v1/files/{id}
- Webhooks
  - POST /v1/webhooks/endpoints
  - GET /v1/webhooks/deliveries?filter[event]=...

Response examples:
- List with cursor:
  {
    "data": [ ...items ],
    "nextCursor": "eyJpZCI6IjEyMyIsImNyZWF0ZWRBdCI6IjIwMjUtMTEtMDdU..."
  }

- Creation with idempotency:
  - Client sends Idempotency-Key; server stores result keyed by it; repeat requests return same 201 + resource or 200 if already created.

Webhooks:
- Outbound events for important state changes (user.created, project.archived).
- Sign payloads (HMAC); retries with backoff; management UI for delivery logs.

Realtime (optional):
- WebSocket (Socket.IO) or SSE for live updates (e.g., task progress). Authenticate via JWT; enforce namespaces and rate limits.

GraphQL (optional):
- Add GraphQL gateway if clients need flexible querying. Keep REST for core flows.


## 8) Data Model Skeleton

- users(id, org_id, email, name, role, status, created_at, updated_at)
- orgs(id, name, plan, status, created_at, updated_at)
- memberships(id, user_id, org_id, role)
- projects(id, org_id, name, description, status, created_at, updated_at)
- tasks(id, project_id, assignee_id, title, description, status, priority, due_at, created_at, updated_at)
- files(id, org_id, key, bucket, content_type, size, created_at, uploaded_by)
- webhook_endpoints(id, org_id, url, secret, events[], created_at)
- webhook_deliveries(id, endpoint_id, event, status, attempt, payload, created_at)

Use indexes on foreign keys and common filters; partial indexes on status columns; RLS policies by org_id if using RLS.


## 9) Security Posture

- OWASP ASVS as baseline; regular security reviews and threat modeling.
- HTTP security headers: CSP (with nonces), HSTS, X-Content-Type-Options, Referrer-Policy, Permissions-Policy.
- AuthN: OIDC; short-lived JWT access tokens; refresh using rotation; revoke via token blacklist if needed.
- AuthZ: RBAC/ABAC via policies; check tenant boundaries in every query.
- Input validation (server and client); sanitize outputs.
- Secrets: managed service (AWS Secrets Manager/GCP Secret Manager/Azure Key Vault) or sealed secrets; rotate regularly; avoid plaintext in repos.
- Dependency and container scans; SBOMs (Syft); signed containers (cosign); verify in admission controller.
- Backups encrypted at rest; TLS in transit everywhere; DB encryption at rest.
- WAF and DDoS protection at edge (Cloudflare/AWS Shield); bot protection where relevant.


## 10) Observability and Operations

- Logs: structured JSON with Pino; include requestId, userId, orgId, path, latency, status; redact PII.
- Metrics: RED (Rate, Errors, Duration) for APIs; job queue gauges; DB connection pool; cache hit ratio.
- Traces: distributed tracing via OpenTelemetry; propagate context across services and jobs.
- Dashboards: SLOs (e.g., 99.9% availability, p95 latency < 300ms); burn-rate alerts.
- Health checks: liveness, readiness, and startup probes.
- Runbooks: incident playbooks, on-call rotation, postmortem templates.


## 11) Testing Strategy

- Unit tests: 60–80% coverage on critical services/utilities; fast and parallelized.
- Integration tests: Testcontainers for Postgres/Redis; realistic data and migrations.
- API e2e: spin server in CI, run Supertest/Playwright against it; seed/teardown.
- Contract tests: validate OpenAPI; optional Pact for consumer-driven.
- Frontend: component tests with Testing Library; e2e with Playwright against preview deployments.
- Performance tests: k6/Gatling for core flows; load and soak tests pre-release.
- Security tests: SAST/DAST; dependency scanning; container scanning; secret scanning (gitleaks/trufflehog).


## 12) Deployment Strategy

Environments:
- Dev (local + feature previews), Staging, Production. Optional UAT.

Images and artifacts:
- Build Docker images with multi-stage, distroless runtime; tag with git SHA and semver; push to registry.
- Generate SBOM and sign images (cosign). Scan with Trivy/Snyk.

Backend on Kubernetes (recommended default):
- Ingress: NGINX Ingress or cloud LB; TLS via cert-manager + Let’s Encrypt.
- Autoscaling: HPA on CPU/RAM and custom metrics (RPS, queue depth).
- Config: ConfigMaps and Secrets; mount OIDC JWKS cache TTLs.
- DB: Managed Postgres (RDS/Cloud SQL/PAAS); set max connections; use pgbouncer if needed.
- Redis: Managed (Elasticache/Memorystore) or operator-managed in-cluster for non-prod.
- Jobs: worker Deployment(s); scheduled jobs via CronJobs; separate queues per concern.
- Migrations: run Prisma migrate in a pre-deploy job; ensure backward-compatible migrations.
- Rollouts: blue/green or canary; progressive delivery (Argo Rollouts/Flagger).

Frontend deployment options:
- Vercel (best DX): Edge network, ISR, image optimization, preview deployments per PR.
- Self-hosted: Next.js server in a container behind CDN (CloudFront/Cloudflare); configure caching and ISR revalidation hooks.

CDN and edge:
- Serve static assets from CDN; cache API GET responses when safe with ETag/Cache-Control.

Serverless alternative (when ops light or spiky workloads):
- Backend: API Gateway + Lambda (Node 24), DynamoDB or Aurora Serverless; careful with cold starts and Prisma client bundling (consider Data Proxy).
- Jobs: EventBridge + Lambda; Step Functions for workflows.
- Pros: Reduced ops; pay-per-use.
- Cons: Local dev complexity; VPC networking; connection management.


## 13) CI/CD Pipelines (GitHub Actions example)

- On PR:
  - Lint (ESLint, Prettier), Typecheck, Unit tests
  - Build web and api
  - Integration tests with Testcontainers
  - Upload preview deployment (Vercel) and ephemeral DB schema
- On main merge:
  - Build & scan images, push to registry
  - Run DB migrations (dry-run then apply)
  - Deploy to staging (Helm), run smoke tests, then promote to prod
  - Notify Slack; create release notes (Changesets)

Safeguards:
- Require code reviews, status checks, conventional commits.
- Secrets from OIDC/GitHub OIDC to cloud; no long-lived deploy keys.


## 14) Scalability and Evolution Plan

Start: Modular monolith with clean boundaries and an internal event bus.
Evolve:
- Extract high-churn/high-throughput modules (e.g., notifications, reports) into services when needed.
- Introduce Kafka for event-driven architecture if needed for scale/analytics.
- Database read replicas for heavy read endpoints; caching layers for hot paths.
- Multi-region active/passive or active/active based on RPO/RTO; global CDN for frontend.


## 15) Governance and Developer Experience

- TypeScript strict mode; path aliases; absolute imports.
- ESLint + Prettier; Husky + lint-staged on pre-commit; commitlint for conventional commits.
- Storybook for component libraries (optional).
- ADRs (Architecture Decision Records) in repo to document key choices.
- Code owners; PR templates; automated dependency updates (Renovate).


## 16) Cost and Vendor Considerations

- Managed DB and Redis cost dominates early; right-size instances and enable autoscaling.
- Prefer managed identity (OIDC) to reduce security burden; watch monthly MAU costs.
- Observe egress costs for object storage and CDN.
- Consider PaaS (Vercel/Render/Fly.io) to cut ops time early; plan migration paths to k8s if needed later.


## 17) Initial Backlog and Milestones

M1: Repo scaffolding (monorepo), CI lint/test/build, basic infra (staging), health checks, OpenAPI stub, minimal auth, users service, Next.js shell with auth.
M2: Orgs/projects/tasks MVP; caching; background jobs; file uploads; observability dashboards; preview deployments.
M3: Webhooks, rate limiting, audit log, RBAC, i18n, admin UI; performance budgets; SLOs/alerts.
M4: Multi-tenant hardening (RLS), feature flags, billing integration, data export tooling.


## 18) Why These Choices Now (2025 context)

- Node.js 24 is the current LTS, offering long-term stability and performance/diagnostics improvements.
- React 19 and Next.js 16 provide mature Server Components, improved compiler support, and stable DX for hybrid rendering.
- Prisma + Postgres remains a best-in-class combo for developer productivity and data integrity.
- Modular monolith lets teams ship fast without premature microservices complexity, with a clear path to evolve.

This architecture balances simplicity and scalability, optimizing for speed-to-value now and growth later.
