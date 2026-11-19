# TikZ Studio web app (Next.js + pg-boss worker in one process).
# The LaTeX sandbox is a separate image (docker/compiler/Dockerfile); this
# container starts it through the host Docker daemon, so it only needs the
# Docker CLI, not a daemon.

FROM docker:28-cli AS docker-cli

FROM node:22-bookworm-slim AS deps
WORKDIR /app
COPY package.json package-lock.json prisma.config.ts ./
COPY prisma ./prisma
# prisma.config.ts reads DATABASE_URL during `prisma generate` (postinstall).
RUN DATABASE_URL=postgresql://build:build@localhost:5432/build npm ci

FROM node:22-bookworm-slim AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/generated ./generated
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
# Build-time placeholders only (scoped to this step); real values come from
# the runtime environment.
RUN DATABASE_URL=postgresql://build:build@localhost:5432/build \
    BETTER_AUTH_SECRET=build-time-placeholder \
    npm run build

FROM node:22-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000
COPY --from=docker-cli /usr/local/bin/docker /usr/local/bin/docker
COPY --from=builder /app ./
EXPOSE 3000
# Apply pending migrations, seed official templates (idempotent), then serve.
CMD ["sh", "-c", "npx prisma migrate deploy && npm run db:seed && npm run start"]
