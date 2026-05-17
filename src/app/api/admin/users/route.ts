import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { paginated, error, requireAdmin } from '@/lib/api-helpers';

export async function GET(request: NextRequest) {
  try {
    const { user: admin, error: authError } = await requireAdmin(request);
    if (authError) return authError;

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, Number(searchParams.get('page')) || 1);
    const limit = Math.min(100, Math.max(1, Number(searchParams.get('limit')) || 20));
    const skip = (page - 1) * limit;
    const search = searchParams.get('search');

    const where: Record<string, unknown> = {};
    if (search) {
      // SQLite LIKE is case-insensitive by default — no mode option needed
      where.OR = [
        { name: { contains: search.trim() } },
        { email: { contains: search.trim() } },
      ];
    }

    const [users, total] = await Promise.all([
      db.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          avatar: true,
          isVerified: true,
          referralCode: true,
          createdAt: true,
          _count: { select: { votes: true, sentReferrals: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      db.user.count({ where }),
    ]);

    const data = users.map((u) => ({
      ...u,
      _count: { votes: u._count.votes, sentReferrals: u._count.sentReferrals },
    }));

    return paginated(data, { page, limit, total });
  } catch (err) {
    console.error('Admin list users error:', err);
    return error('Failed to load users', 500);
  }
}
