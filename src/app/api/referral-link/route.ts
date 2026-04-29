import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserFromRequest } from '@/lib/api-helpers';

export async function GET(request: NextRequest) {
  try {
    const { user, error } = await getUserFromRequest(request);
    if (error) return error;

    const userData = await db.user.findUnique({
      where: { id: user!.userId },
      select: { referralCode: true },
    });

    if (!userData) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    // Check if vote link exists, create if not
    const { searchParams } = new URL(request.url);
    const contestantId = searchParams.get('contestantId');

    if (contestantId) {
      // Verify contestant exists
      const contestant = await db.contestant.findUnique({
        where: { id: contestantId },
      });
      if (!contestant) {
        return NextResponse.json(
          { success: false, message: 'Contestant not found' },
          { status: 404 }
        );
      }

      let voteLink = await db.voteLink.findFirst({
        where: { userId: user!.userId, contestantId },
      });

      if (!voteLink) {
        const code = `VL-${userData.referralCode}-${contestantId.slice(0, 6).toUpperCase()}`;
        voteLink = await db.voteLink.create({
          data: {
            userId: user!.userId,
            contestantId,
            code,
          },
        });
      }

      return NextResponse.json({
        success: true,
        data: {
          referralCode: userData.referralCode,
          contestantId,
          voteLink: {
            code: voteLink.code,
            clickCount: voteLink.clickCount,
          },
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        referralCode: userData.referralCode,
        referralUrl: `/register?ref=${userData.referralCode}`,
      },
    });
  } catch (error) {
    console.error('Get referral link error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
