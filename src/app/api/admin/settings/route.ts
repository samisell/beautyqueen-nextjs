import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { success, error, requireAdmin } from '@/lib/api-helpers';

// Default platform settings
const DEFAULTS: Record<string, string> = {
  votePrice: '200',
  currency: 'NGN',
  platformName: 'Beauty Vote',
};

export async function GET(_request: NextRequest) {
  try {
    const { user: admin, error: authError } = await requireAdmin(_request);
    if (authError) return authError;

    const settings = await db.platformSetting.findMany();
    const settingsMap: Record<string, string> = { ...DEFAULTS };
    for (const s of settings) {
      settingsMap[s.key] = s.value;
    }

    return success(settingsMap);
  } catch (err) {
    console.error('Get settings error:', err);
    return error('Failed to load settings', 500);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { user: admin, error: authError } = await requireAdmin(request);
    if (authError) return authError;

    const body = await request.json();
    const { votePrice, currency, platformName } = body;

    const updates: { key: string; value: string }[] = [];

    if (votePrice !== undefined) {
      const price = Number(votePrice);
      if (isNaN(price) || price < 0) {
        return error('Vote price must be a valid non-negative number', 400);
      }
      if (price > 1000000) {
        return error('Vote price seems unreasonably high', 400);
      }
      updates.push({ key: 'votePrice', value: String(price) });
    }

    if (currency !== undefined) {
      if (typeof currency !== 'string' || currency.trim().length < 1 || currency.trim().length > 10) {
        return error('Currency must be a string of 1-10 characters', 400);
      }
      updates.push({ key: 'currency', value: currency.trim().toUpperCase() });
    }

    if (platformName !== undefined) {
      if (typeof platformName !== 'string' || platformName.trim().length < 1 || platformName.trim().length > 100) {
        return error('Platform name must be 1-100 characters', 400);
      }
      updates.push({ key: 'platformName', value: platformName.trim() });
    }

    if (updates.length === 0) {
      return error('No valid settings to update', 400);
    }

    const results = await Promise.all(
      updates.map(({ key, value }) =>
        db.platformSetting.upsert({
          where: { key },
          update: { value },
          create: { key, value },
        })
      )
    );

    return success(
      results.reduce((acc, r) => {
        acc[r.key] = r.value;
        return acc;
      }, {} as Record<string, string>),
      200,
      { message: 'Settings updated successfully' }
    );
  } catch (err) {
    console.error('Update settings error:', err);
    return error('Failed to update settings', 500);
  }
}
