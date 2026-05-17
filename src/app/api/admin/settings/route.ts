import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { success, error, requireAdmin } from '@/lib/api-helpers';

// Default platform settings
const DEFAULTS: Record<string, string> = {
  votePrice: '200',
  currency: 'NGN',
  platformName: 'Beauty Queen',
  // Offline payment bank details
  offlineBankName: 'Beauty Queen Holdings',
  offlineAccountName: 'Beauty Queen Platform',
  offlineAccountNumber: '1234567890',
  offlineBankBranch: 'Main Branch',
  // Prize amounts (in the platform's currency)
  prize1st: '5000000',
  prize2nd: '3000000',
  prize3rd: '1500000',
  prizeCurrency: 'NGN',
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
    const updates: { key: string; value: string }[] = [];

    // --- Platform Name ---
    if (body.platformName !== undefined) {
      if (typeof body.platformName !== 'string' || body.platformName.trim().length < 1 || body.platformName.trim().length > 100) {
        return error('Platform name must be 1-100 characters', 400);
      }
      updates.push({ key: 'platformName', value: body.platformName.trim() });
    }

    // --- Vote Price ---
    if (body.votePrice !== undefined) {
      const price = Number(body.votePrice);
      if (isNaN(price) || price < 0) {
        return error('Vote price must be a valid non-negative number', 400);
      }
      if (price > 1000000) {
        return error('Vote price seems unreasonably high', 400);
      }
      updates.push({ key: 'votePrice', value: String(price) });
    }

    // --- Currency ---
    if (body.currency !== undefined) {
      if (typeof body.currency !== 'string' || body.currency.trim().length < 1 || body.currency.trim().length > 10) {
        return error('Currency must be a string of 1-10 characters', 400);
      }
      updates.push({ key: 'currency', value: body.currency.trim().toUpperCase() });
    }

    // --- Offline Bank Details ---
    if (body.offlineBankName !== undefined) {
      const val = String(body.offlineBankName).trim();
      if (val.length < 1 || val.length > 200) return error('Bank name must be 1-200 characters', 400);
      updates.push({ key: 'offlineBankName', value: val });
    }
    if (body.offlineAccountName !== undefined) {
      const val = String(body.offlineAccountName).trim();
      if (val.length < 1 || val.length > 200) return error('Account name must be 1-200 characters', 400);
      updates.push({ key: 'offlineAccountName', value: val });
    }
    if (body.offlineAccountNumber !== undefined) {
      const val = String(body.offlineAccountNumber).trim();
      if (val.length < 1 || val.length > 30) return error('Account number must be 1-30 characters', 400);
      updates.push({ key: 'offlineAccountNumber', value: val });
    }
    if (body.offlineBankBranch !== undefined) {
      const val = String(body.offlineBankBranch).trim();
      if (val.length < 1 || val.length > 200) return error('Bank branch must be 1-200 characters', 400);
      updates.push({ key: 'offlineBankBranch', value: val });
    }

    // --- Prize Amounts ---
    if (body.prize1st !== undefined) {
      const val = Number(body.prize1st);
      if (isNaN(val) || val < 0) return error('1st place prize must be a valid non-negative number', 400);
      updates.push({ key: 'prize1st', value: String(val) });
    }
    if (body.prize2nd !== undefined) {
      const val = Number(body.prize2nd);
      if (isNaN(val) || val < 0) return error('2nd place prize must be a valid non-negative number', 400);
      updates.push({ key: 'prize2nd', value: String(val) });
    }
    if (body.prize3rd !== undefined) {
      const val = Number(body.prize3rd);
      if (isNaN(val) || val < 0) return error('3rd place prize must be a valid non-negative number', 400);
      updates.push({ key: 'prize3rd', value: String(val) });
    }
    if (body.prizeCurrency !== undefined) {
      const val = String(body.prizeCurrency).trim();
      if (val.length < 1 || val.length > 10) return error('Prize currency must be 1-10 characters', 400);
      updates.push({ key: 'prizeCurrency', value: val.toUpperCase() });
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
