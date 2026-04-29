import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { success, error } from '@/lib/api-helpers';

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

export async function GET(_request: NextRequest) {
  try {
    const settings = await db.platformSetting.findMany({
      where: { key: { in: Array.from(PUBLIC_KEYS) } },
    });
    const settingsMap: Record<string, string> = { ...PUBLIC_DEFAULTS };
    for (const s of settings) {
      settingsMap[s.key] = s.value;
    }
    return success(settingsMap);
  } catch (err) {
    console.error('Get public settings error:', err);
    return error('Failed to load settings', 500);
  }
}
