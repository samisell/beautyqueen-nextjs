# ---- Build Stage ----
FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies
FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci

# Build the application
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build a Linux-compatible seed script for the runtime image.
RUN npx tsc prisma/seed.ts --outDir .seed-build --module commonjs --target es2020 --esModuleInterop --skipLibCheck \
  && cp .seed-build/seed.js prisma/seed.js

# Build Next.js
ENV NEXT_TELEMETRY_DISABLED=1
ENV JWT_SECRET=build-only-jwt-secret
ENV REFRESH_SECRET=build-only-refresh-secret
ENV DATABASE_URL=postgresql://build:build@localhost:5432/beautyvote
RUN npm run build

# ---- Production Stage ----
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built app
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copy full runtime dependencies so Prisma CLI bootstrap has all of its
# transitive modules available during container startup.
COPY --from=builder /app/node_modules ./node_modules

# Copy Prisma schema for migrations & optional seed script
COPY --from=builder /app/prisma ./prisma

# Copy and prepare entrypoint bootstrap script
COPY --chown=nextjs:nodejs entrypoint.sh ./entrypoint.sh
RUN chmod +x entrypoint.sh

# Create uploads directory
RUN mkdir -p /app/public/uploads/proofs /app/public/uploads/contestants
RUN chown -R nextjs:nodejs /app/public/uploads

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

ENTRYPOINT ["./entrypoint.sh"]
