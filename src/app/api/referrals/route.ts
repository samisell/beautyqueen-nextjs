import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { paginated, parsePagination, getUserFromRequest, error, success } from '@/lib/api-helpers';

export async function GET(request: NextRequest) {
  try {
    const { user, error: authError } = await getUserFromRequest(request);
    if (authError) return authError;

    const { searchParams } = new URL(request.url);
    const { page, limit, skip } = parsePagination(searchParams);

    // Get referral stats for summary
    const [referralStats, totalReferrals] = await Promise.all([
      db.referral.aggregate({
        where: { referrerId: user.userId },
        _count: true,
        _sum: { bonusVotes: true },
      }),
      db.referral.count({ where: { referrerId: user.userId } }),
    ]);

    // Get paginated referral list with referred user info
    const referrals = await db.referral.findMany({
      where: { referrerId: user.userId },
      include: {
        referred: {
          select: {
            id: true,
            name: true,
            email: true,
            createdAt: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    });

    const referralsWithInfo = referrals.map((r) => ({
      id: r.id,
      bonusVotes: r.bonusVotes,
      referredUser: {
        id: r.referred.id,
        name: r.referred.name,
        email: r.referred.email,
        joinedAt: r.referred.createdAt,
      },
      createdAt: r.createdAt,
    }));

    // Build paginated response with summary
    const response = paginated(referralsWithInfo, { page, limit, total: totalReferrals });

    // Add summary stats
    const responseData = (response as unknown as Record<string, unknown>);
    responseData.summary = {
      totalReferrals: referralStats._count || 0,
      totalBonusVotes: referralStats._sum.bonusVotes || 0,
    };

    return response;
  } catch (err) {
    console.error('Get referrals error:', err);
    return error('Failed to load referrals', 500);
  }
}
