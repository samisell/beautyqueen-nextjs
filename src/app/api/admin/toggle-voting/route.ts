import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { success, error, requireAdmin } from '@/lib/api-helpers';

// GET /api/admin/toggle-voting — Get current voting status
export async function GET(_request: NextRequest) {
  try {
    const { user: admin, error: authError } = await requireAdmin(_request);
    if (authError) return authError;

    const setting = await db.platformSetting.findUnique({ where: { key: 'votingEnabled' } });
    const isEnabled = setting ? setting.value === 'true' : true; // default enabled

    return success({ votingEnabled: isEnabled });
  } catch (err) {
    console.error('Get voting toggle error:', err);
    return error('Failed to get voting status', 500);
  }
}

// POST /api/admin/toggle-voting — Toggle voting on/off
export async function POST(request: NextRequest) {
  try {
    const { user: admin, error: authError } = await requireAdmin(request);
    if (authError) return authError;

    const current = await db.platformSetting.findUnique({ where: { key: 'votingEnabled' } });
    const currentValue = current ? current.value === 'true' : true;
    const newValue = !currentValue;

    await db.platformSetting.upsert({
      where: { key: 'votingEnabled' },
      update: { value: String(newValue) },
      create: { key: 'votingEnabled', value: String(newValue) },
    });

    return success({ votingEnabled: newValue }, 200, {
      message: `Voting has been ${newValue ? 'enabled' : 'disabled'}`,
    });
  } catch (err) {
    console.error('Toggle voting error:', err);
    return error('Failed to toggle voting', 500);
  }
}
