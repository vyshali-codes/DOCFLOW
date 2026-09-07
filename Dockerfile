# ─────────────────────────────────────────────────────────────────────────────
# Stage 1 — Builder
#   Installs ALL dependencies and compiles:
#     • Vite frontend  →  dist/
#     • Express server →  dist/server.cjs  (via esbuild)
# ─────────────────────────────────────────────────────────────────────────────
FROM node:22-alpine AS builder

WORKDIR /app

# Configure npm for resilient network behaviour inside Docker:
#   - retry 5 times on transient errors (ECONNRESET, ETIMEDOUT)
#   - raise fetch/socket timeouts to 120 s
#   - limit concurrent connections to avoid overwhelming the registry
RUN npm config set fetch-retries 5 \
    && npm config set fetch-retry-mintimeout 20000 \
    && npm config set fetch-retry-maxtimeout 120000 \
    && npm config set fetch-timeout 120000 \
    && npm config set maxsockets 5

# Copy dependency manifests first for better layer caching
COPY package.json package-lock.json ./

# Install all dependencies (including devDependencies needed for build)
RUN npm ci --prefer-offline --legacy-peer-deps --ignore-scripts

# Copy the full source tree
COPY . .

# Build: Vite (frontend) + esbuild (server bundle)
RUN npm run build

# ─────────────────────────────────────────────────────────────────────────────
# Stage 2 — Production
#   Slim image that only ships what is needed at runtime:
#     • Compiled frontend  (dist/  — static assets served by Express)
#     • Compiled server    (dist/server.cjs)
#     • Production node_modules
# ─────────────────────────────────────────────────────────────────────────────
FROM node:22-alpine AS production

# Security: run as non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

# Same resilient npm settings for the production install stage
RUN npm config set fetch-retries 5 \
    && npm config set fetch-retry-mintimeout 20000 \
    && npm config set fetch-retry-maxtimeout 120000 \
    && npm config set fetch-timeout 120000 \
    && npm config set maxsockets 5

# Copy dependency manifests and install production deps only
COPY package.json package-lock.json ./
RUN npm ci --omit=dev --prefer-offline --legacy-peer-deps --ignore-scripts \
    && npm cache clean --force

# Copy compiled artefacts from the builder stage
COPY --from=builder /app/dist ./dist

# Create uploads directory with correct ownership
RUN mkdir -p uploads && chown -R appuser:appgroup /app

# Switch to non-root user
USER appuser

# The server reads PORT from the environment (defaults to 3000 locally,
# 8080 on Cloud Run when K_SERVICE is set — see server.ts line 15)
EXPOSE 3000

# Health-check: hits the /api/health endpoint added in server.ts
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
    CMD wget -qO- http://127.0.0.1:3000/api/health || exit 1

# Start the compiled server bundle
CMD ["node", "dist/server.cjs"]
