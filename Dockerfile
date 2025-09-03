# Build-Stage
FROM node:22 AS build
WORKDIR /usr/src/app
COPY package.json pnpm-lock.yaml ./
RUN corepack enable && corepack prepare pnpm@10.15.1 --activate
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm run build

# Runtime-Stage
FROM node:22-alpine AS runtime
WORKDIR /usr/src/app
COPY package.json pnpm-lock.yaml ./
RUN corepack enable && corepack prepare pnpm@10.15.1 --activate
RUN pnpm install --prod --frozen-lockfile
COPY --from=build /usr/src/app/build ./build
EXPOSE 2567
CMD ["node", "build/index.js"]