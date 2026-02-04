# ============================================================
# Multi-stage Dockerfile for loyalty-saas monorepo
# Targets: backend, dashboard, portal, kiosk
# ============================================================

# ── Base ─────────────────────────────────────────────────────
FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate
WORKDIR /app

# ── Install dependencies ────────────────────────────────────
FROM base AS deps

# Copy workspace & lockfile first (cache layer)
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml turbo.json ./

# Copy every package.json so pnpm can resolve the workspace
COPY backend/package.json backend/
COPY shared/package.json shared/
COPY frontend/apps/dashboard/package.json frontend/apps/dashboard/
COPY frontend/apps/portal/package.json frontend/apps/portal/
COPY frontend/apps/kiosk/package.json frontend/apps/kiosk/
COPY frontend/packages/ui/package.json frontend/packages/ui/
COPY frontend/packages/types/package.json frontend/packages/types/
COPY frontend/packages/api-client/package.json frontend/packages/api-client/
COPY frontend/packages/i18n/package.json frontend/packages/i18n/
COPY frontend/packages/utils/package.json frontend/packages/utils/
COPY frontend/packages/config/package.json frontend/packages/config/
COPY frontend/packages/store/package.json frontend/packages/store/

RUN pnpm install --frozen-lockfile

# ── Full source ─────────────────────────────────────────────
FROM deps AS source
COPY . .

# ════════════════════════════════════════════════════════════
#  BACKEND
# ════════════════════════════════════════════════════════════
FROM source AS backend
EXPOSE 3001
# Use tsx to run TypeScript directly (handles workspace:* TS imports)
CMD ["pnpm", "--filter", "@loyalty/backend", "dev"]

# ════════════════════════════════════════════════════════════
#  DASHBOARD  (Next.js standalone build)
# ════════════════════════════════════════════════════════════
FROM source AS dashboard-build
ENV NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
RUN pnpm --filter @loyalty/dashboard build

FROM base AS dashboard
COPY --from=dashboard-build /app/frontend/apps/dashboard/.next/standalone ./
COPY --from=dashboard-build /app/frontend/apps/dashboard/.next/static ./frontend/apps/dashboard/.next/static
COPY --from=dashboard-build /app/frontend/apps/dashboard/public ./frontend/apps/dashboard/public
EXPOSE 3000
CMD ["node", "frontend/apps/dashboard/server.js"]

# ════════════════════════════════════════════════════════════
#  PORTAL  (Next.js standalone build)
# ════════════════════════════════════════════════════════════
FROM source AS portal-build
ENV NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
RUN pnpm --filter @loyalty/portal build

FROM base AS portal
COPY --from=portal-build /app/frontend/apps/portal/.next/standalone ./
COPY --from=portal-build /app/frontend/apps/portal/.next/static ./frontend/apps/portal/.next/static
COPY --from=portal-build /app/frontend/apps/portal/public ./frontend/apps/portal/public
EXPOSE 3002
CMD ["node", "frontend/apps/portal/server.js"]

# ════════════════════════════════════════════════════════════
#  KIOSK  (Next.js standalone build)
# ════════════════════════════════════════════════════════════
FROM source AS kiosk-build
ENV NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
RUN pnpm --filter @loyalty/kiosk build

FROM base AS kiosk
COPY --from=kiosk-build /app/frontend/apps/kiosk/.next/standalone ./
COPY --from=kiosk-build /app/frontend/apps/kiosk/.next/static ./frontend/apps/kiosk/.next/static
COPY --from=kiosk-build /app/frontend/apps/kiosk/public ./frontend/apps/kiosk/public
EXPOSE 3003
CMD ["node", "frontend/apps/kiosk/server.js"]
