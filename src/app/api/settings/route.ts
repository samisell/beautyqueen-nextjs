import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { success, error } from '@/lib/api-helpers';
import { cachedFetch, invalidateCache } from '@/lib/cache';

// Public settings that don't require authentication
const PUBLIC_DEFAULTS: Record<string, string> = {
  votePrice: '200',
  currency: 'NGN',
  platformName: 'Beauty Vote',
  prize1st: '5000000',
  prize2nd: '3000000',
  prize3rd: '1500000',
  prizeCurrency: 'NGN',
  offlineBankName: 'BeautyVote Holdings',
  offlineAccountName: 'BeautyVote Platform',
  offlineAccountNumber: '1234567890',
  offlineBankBranch: 'Main Branch',
  votingEnabled: 'true',
};

// Keys safe to expose publicly
const PUBLIC_KEYS = new Set(Object.keys(PUBLIC_DEFAULTS));

const CACHE_KEY = 'platform-settings-public';
const CACHE_TTL = 2 * 60 * 1000; // 2 minutes

export async function GET(_request: NextRequest) {
  try {
    const settingsMap = await cachedFetch<Record<string, string>>(
      CACHE_KEY,
      async () => {
        const settings = await db.platformSetting.findMany({
          where: { key: { in: Array.from(PUBLIC_KEYS) } },
        });
        const map: Record<string, string> = { ...PUBLIC_DEFAULTS };
        for (const s of settings) {
          map[s.key] = s.value;
        }
        return map;
      },
      CACHE_TTL,
    );
    return success(settingsMap);
  } catch (err) {
    console.error('Get public settings error:', err);
    return error('Failed to load settings', 500);
  }
}

// Allow POST to invalidate cache when admin updates settings
// (Called internally — not exposed as a public API)
export { invalidateCache };
