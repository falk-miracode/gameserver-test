# Multi-stage build for Colyseus Backend in Monorepo
FROM node:22-alpine AS base
WORKDIR /usr/src/app
RUN corepack enable

# Dependencies stage
FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/schemas/package.json ./packages/schemas/
COPY packages/backend/package.json ./packages/backend/
RUN pnpm install --frozen-lockfile

# Build stage  
FROM base AS build
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/schemas/package.json ./packages/schemas/
COPY packages/backend/package.json ./packages/backend/
COPY --from=deps /usr/src/app/node_modules ./node_modules
COPY packages/schemas/ ./packages/schemas/
COPY packages/backend/ ./packages/backend/
RUN pnpm build:schemas && pnpm build:backend

# Production dependencies
FROM base AS prod-deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/schemas/package.json ./packages/schemas/
COPY packages/backend/package.json ./packages/backend/
RUN pnpm install --prod --frozen-lockfile

# Runtime stage
FROM node:22-alpine AS runtime
WORKDIR /usr/src/app

# Copy production dependencies
COPY --from=prod-deps /usr/src/app/node_modules ./node_modules
COPY --from=prod-deps /usr/src/app/packages ./packages

# Copy built application
COPY --from=build /usr/src/app/packages/schemas/dist ./packages/schemas/dist
COPY --from=build /usr/src/app/packages/backend/dist ./packages/backend/dist

# Copy package files for runtime
COPY package.json pnpm-workspace.yaml ./
COPY packages/schemas/package.json ./packages/schemas/
COPY packages/backend/package.json ./packages/backend/

# Set working directory to backend
WORKDIR /usr/src/app/packages/backend

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && adduser -S colyseus -u 1001
USER colyseus

EXPOSE 2567
CMD ["node", "dist/index.js"]
