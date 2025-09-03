# Multi-stage build for Colyseus Backend in Monorepo
FROM node:22 AS build
WORKDIR /usr/src/app
RUN corepack enable

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/schemas/package.json ./packages/schemas/
COPY packages/backend/package.json ./packages/backend/

# Install all dependencies (including dev dependencies for building)
RUN pnpm install --frozen-lockfile

# Copy source code
COPY packages/schemas/ ./packages/schemas/
COPY packages/backend/ ./packages/backend/

# Build schemas first, then backend
RUN pnpm build:schemas && pnpm build:backend

# Debug: List built files
RUN ls -la packages/schemas/ || echo "schemas directory not found"
RUN ls -la packages/schemas/dist/ || echo "schemas dist directory not found"  
RUN ls -la packages/backend/ || echo "backend directory not found"
RUN ls -la packages/backend/dist/ || echo "backend dist directory not found"

# Production stage
FROM node:22-alpine AS runtime
WORKDIR /usr/src/app
RUN corepack enable

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/schemas/package.json ./packages/schemas/
COPY packages/backend/package.json ./packages/backend/

# Install only production dependencies
RUN pnpm install --prod --frozen-lockfile

# Copy built application
COPY --from=build /usr/src/app/packages/schemas/dist ./packages/schemas/dist
COPY --from=build /usr/src/app/packages/backend/dist ./packages/backend/dist

# Debug: Verify copied files
RUN ls -la packages/backend/ || echo "backend directory not found in runtime"
RUN ls -la packages/backend/dist/ || echo "backend dist directory not found in runtime"

# Set working directory to backend
WORKDIR /usr/src/app/packages/backend

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && adduser -S colyseus -u 1001
USER colyseus

EXPOSE 2567
CMD ["node", "dist/index.js"]
