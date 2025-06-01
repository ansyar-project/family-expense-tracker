# 1. Install dependencies with pnpm
FROM node:22-alpine AS deps
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@latest --activate

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# 2. Build the app
FROM node:22-alpine AS builder
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@latest --activate

COPY --from=deps /app/node_modules ./node_modules
COPY . .


RUN npx prisma generate && pnpm build

# 3. Production image
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN apk add --no-cache curl && corepack enable && corepack prepare pnpm@latest --activate

# Copy Prisma schema, migrations, and SQLite DB (if present)
COPY --from=builder /app/prisma ./prisma
# COPY --from=builder /app/.env ./

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000

# Run migrations and seed before starting the app
CMD ["sh", "-c", "pnpm prisma migrate deploy && pnpm start"]