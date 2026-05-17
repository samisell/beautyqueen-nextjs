# ---- Build Stage ----
FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies
FROM base AS deps
COPY package.json bun.lock* ./
RUN npm install -g bun && bun install --frozen-lockfile

# Build the application
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build Next.js and compile seed script
ENV NEXT_TELEMETRY_DISABLED=1
RUN bun run build
RUN bun build prisma/seed.ts --outfile=prisma/seed.js --target=node

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

# Copy Prisma schema for migrations & compiled seed script
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/node_modules/prisma ./node_modules/prisma

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
