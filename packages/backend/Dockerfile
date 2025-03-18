# Stage 1: Build
FROM node:20-alpine AS builder
RUN npm install -g pnpm
WORKDIR /app
COPY . .
RUN pnpm install --frozen-lockfile
RUN pnpm run build

# Stage 2: Production
FROM node:20-alpine
RUN npm install -g pnpm
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY package.json pnpm-lock.yaml* ./
COPY supabase/migrations supabase/migrations
RUN pnpm install --frozen-lockfile --prod
ENV PORT=8080
EXPOSE $PORT
CMD ["pnpm", "start:prod"]
