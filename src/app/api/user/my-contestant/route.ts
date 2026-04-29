import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { success, error, getUserFromRequest } from '@/lib/api-helpers';

/**
 * GET /api/user/my-contestant
 *
 * Returns the authenticated user's contestant profile if they have one.
 * Includes tournament info, stage, category, vote count, rank, and votingEnabled.
 */
export async function GET(_request: NextRequest) {
  try {
    const { user, error: authError } = await getUserFromRequest(_request);
    if (authError) return authError;

    const contestant = await db.contestant.findUnique({
      where: { userId: user.userId },
      include: {
        stage: {
          include: {
            tournament: true,
          },
        },
        categoryRel: true,
      },
    });

    if (!contestant) {
      return success(null);
    }

    // Get vote count
    const voteCount = await db.vote.count({
      where: { contestantId: contestant.id },
    });

    // Get rank among active contestants in the same stage
    let rank: number | null = null;
    if (contestant.stageId) {
      const rankedContestants = await db.contestant.findMany({
        where: {
          stageId: contestant.stageId,
          status: 'active',
        },
        orderBy: { totalVotes: 'desc' },
        select: { id: true },
      });

      const index = rankedContestants.findIndex((c) => c.id === contestant.id);
      if (index >= 0) {
        rank = index + 1;
      }
    }

    // Get votingEnabled from PlatformSetting
    const votingSetting = await db.platformSetting.findUnique({
      where: { key: 'votingEnabled' },
    });
    const votingEnabled = votingSetting?.value === 'true';

    // Get platform settings
    const [
      platformNameSetting,
      votePriceSetting,
      currencySetting,
    ] = await Promise.all([
      db.platformSetting.findUnique({ where: { key: 'platformName' } }),
      db.platformSetting.findUnique({ where: { key: 'votePrice' } }),
      db.platformSetting.findUnique({ where: { key: 'currency' } }),
    ]);

    return success({
      id: contestant.id,
      contestantCode: contestant.id.substring(0, 8).toUpperCase(),
      name: contestant.name,
      bio: contestant.bio,
      imageUrl: contestant.imageUrl,
      category: contestant.category,
      categoryId: contestant.categoryId,
      status: contestant.status,
      totalVotes: contestant.totalVotes,
      voteCount,
      rank,
      votingEnabled,
      createdAt: contestant.createdAt,
      updatedAt: contestant.updatedAt,
      eliminatedAt: contestant.eliminatedAt,
      eliminationReason: contestant.eliminationReason,
      stage: contestant.stage
        ? {
            id: contestant.stage.id,
            name: contestant.stage.name,
            description: contestant.stage.description,
            startDate: contestant.stage.startDate,
            endDate: contestant.stage.endDate,
            status: contestant.stage.status,
            order: contestant.stage.order,
            minVotes: contestant.stage.minVotes,
            maxContestants: contestant.stage.maxContestants,
          }
        : null,
      tournament: contestant.stage?.tournament
        ? {
            id: contestant.stage.tournament.id,
            name: contestant.stage.tournament.name,
            description: contestant.stage.tournament.description,
            status: contestant.stage.tournament.status,
          }
        : null,
      categoryInfo: contestant.categoryRel
        ? {
            id: contestant.categoryRel.id,
            name: contestant.categoryRel.name,
            description: contestant.categoryRel.description,
            icon: contestant.categoryRel.icon,
          }
        : null,
      platform: {
        name: platformNameSetting?.value || 'Beauty Vote',
        votePrice: votePriceSetting?.value || '100',
        currency: currencySetting?.value || 'NGN',
      },
    });
  } catch (err) {
    console.error('Get my contestant error:', err);
    return error('Failed to load contestant profile', 500);
  }
}
