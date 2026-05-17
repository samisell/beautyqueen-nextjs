import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db

/**
 * Execute a Prisma transaction with automatic retry on serialization failures.
 * Production-ready pattern for concurrent write operations.
 */
export async function withTransaction<T>(
  fn: (tx: Parameters<PrismaClient['$transaction']>[0] extends (callback: infer U) => any ? U : never) => Promise<T>,
  maxRetries = 3
): Promise<T> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await db.$transaction(fn, {
        maxWait: 5000,
        timeout: 10000,
      });
    } catch (error: unknown) {
      const isRetryable = error instanceof Error && (
        error.message.includes('Serialization') ||
        error.message.includes('LOCK') ||
        error.message.includes('busy')
      );
      if (isRetryable && attempt < maxRetries - 1) {
        await new Promise((r) => setTimeout(r, 100 * (attempt + 1)));
        continue;
      }
      throw error;
    }
  }
  throw new Error('Transaction failed after max retries');
}
