#!/bin/sh

# Exit immediately if a command exits with a non-zero status
set -e

echo "🚀 Starting BeautyVote Container Bootstrap..."

# 1. Sync database schema
echo "📦 Syncing database schema with Prisma..."
npx prisma db push

# 2. Seed database
if [ -f "prisma/seed.js" ]; then
  echo "🌱 Checking and seeding database..."
  node prisma/seed.js
else
  echo "⚠️ prisma/seed.js not found, skipping seed step."
fi

# 3. Handover execution to the main application
echo "⭐ Launching Next.js Application on port 3000..."
exec node server.js
