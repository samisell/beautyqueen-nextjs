#!/bin/sh

# Exit immediately if a command exits with a non-zero status
set -e

echo "🚀 Starting BeautyVote Container Bootstrap..."
PRISMA_CLI="node /app/node_modules/prisma/build/index.js"

# 1. Apply database migrations
if [ -d "prisma/migrations" ] && [ "$(find prisma/migrations -mindepth 1 -maxdepth 1 -type d | wc -l)" -gt 0 ]; then
  echo "📦 Applying Prisma migrations..."
  $PRISMA_CLI migrate deploy
else
  echo "📦 No Prisma migrations found. Falling back to prisma db push."
  $PRISMA_CLI db push --skip-generate
fi

# 2. Seed database when explicitly enabled
if [ "${RUN_DB_SEED}" = "true" ] && [ -f "prisma/seed.js" ]; then
  echo "🌱 Checking and seeding database..."
  node prisma/seed.js
else
  echo "⏭️ Skipping seed step."
fi

# 3. Handover execution to the main application
echo "⭐ Launching Next.js Application on port 3000..."
exec node server.js
