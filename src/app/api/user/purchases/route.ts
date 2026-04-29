import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { paginated, parsePagination, getUserFromRequest, error } from '@/lib/api-helpers';

/**
 * GET /api/user/purchases?page=1&limit=10
 *
 * Returns user's purchase history including payment details.
 * Only shows purchases that have been completed (votes credited).
 * Pending/offline payments are shown separately via a secondary query.
 */
export async function GET(request: NextRequest) {
  try {
    const { user, error: authError } = await getUserFromRequest(request);
    if (authError) return authError;

    const { searchParams } = new URL(request.url);
    const { page, limit, skip } = parsePagination(searchParams);

    // Get completed purchases (with credited votes)
    const [purchases, total] = await Promise.all([
      db.purchasedVote.findMany({
        where: { userId: user.userId },
        include: {
          package: {
            select: {
              id: true,
              name: true,
              votes: true,
              bonusVotes: true,
              price: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      db.purchasedVote.count({ where: { userId: user.userId } }),
    ]);

    const purchasesWithStats = purchases.map((p) => ({
      id: p.id,
      packageName: p.package?.name || 'Referral Bonus',
      votesAmount: p.votesAmount,
      votesUsed: p.votesUsed,
      votesRemaining: p.votesAmount - p.votesUsed,
      createdAt: p.createdAt,
    }));

    // Get pending/awaiting payments (offline, not yet credited)
    const pendingPayments = await db.payment.findMany({
      where: {
        userId: user.userId,
        status: { in: ['pending', 'awaiting_review'] },
      },
      include: {
        package: {
          select: { id: true, name: true, votes: true, bonusVotes: true, price: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const formattedPending = pendingPayments.map((p) => ({
      id: p.id,
      amount: p.amount,
      status: p.status,
      paymentMethod: p.paymentMethod,
      transactionId: p.transactionId,
      reference: p.reference,
      proofImageUrl: p.proofImageUrl,
      adminNote: p.adminNote,
      totalVotes: p.package ? p.package.votes + p.package.bonusVotes : 0,
      packageName: p.package?.name || 'Unknown Package',
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    }));

    const response = paginated(purchasesWithStats, { page, limit, total });
    const responseBody = await response.json();

    // Attach pending payments as extra data
    responseBody.data = {
      purchases: responseBody.data,
      pendingPayments: formattedPending,
      pendingCount: formattedPending.length,
    };

    return new Response(JSON.stringify(responseBody), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Get user purchases error:', err);
    return error('Failed to load purchase history', 500);
  }
}
