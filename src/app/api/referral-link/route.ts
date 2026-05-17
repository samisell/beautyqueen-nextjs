import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { success, error, getUserFromRequest } from '@/lib/api-helpers';

export async function GET(request: NextRequest) {
  try {
    const { user, error: authError } = await getUserFromRequest(request);
    if (authError) return authError;

    const userData = await db.user.findUnique({
      where: { id: user.userId },
      select: { referralCode: true },
    });

    if (!userData) {
      return error('User not found', 404);
    }

    const { searchParams } = new URL(request.url);
    const contestantId = searchParams.get('contestantId');

    // If contestantId is provided, return or create a VoteLink
    if (contestantId) {
      // Validate contestantId format
      if (typeof contestantId !== 'string' || !contestantId.trim()) {
        return error('Invalid contestant ID', 400);
      }

      // Verify contestant exists
      const contestant = await db.contestant.findUnique({
        where: { id: contestantId.trim() },
        select: { id: true, name: true },
      });
      if (!contestant) {
        return error('Contestant not found', 404);
      }

      // Find or create VoteLink
      let voteLink = await db.voteLink.findFirst({
        where: { userId: user.userId, contestantId: contestantId.trim() },
      });

      if (!voteLink) {
        const code = `VL-${userData.referralCode}-${contestantId.trim().slice(0, 6).toUpperCase()}`;
        voteLink = await db.voteLink.create({
          data: {
            userId: user.userId,
            contestantId: contestantId.trim(),
            code,
          },
        });
      }

      return success({
        referralCode: userData.referralCode,
        contestantId: contestantId.trim(),
        contestantName: contestant.name,
        voteLink: {
          code: voteLink.code,
          clickCount: voteLink.clickCount,
          createdAt: voteLink.createdAt,
        },
      });
    }

    // Default: return referral code and URL
    return success({
      referralCode: userData.referralCode,
      referralUrl: `/register?ref=${userData.referralCode}`,
    });
  } catch (err) {
    console.error('Get referral link error:', err);
    return error('Failed to load referral link', 500);
  }
}
