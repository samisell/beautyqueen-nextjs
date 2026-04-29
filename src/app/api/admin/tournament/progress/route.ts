import { NextRequest } from 'next/server';
import { db, withTransaction } from '@/lib/db';
import { success, error, requireAdmin, rateLimit, getClientIp } from '@/lib/api-helpers';

/**
 * POST /api/admin/tournament/progress
 * Manually trigger or check stage progression.
 * 
 * Logic:
 * 1. Find all stages with endDate <= now and status !== 'completed'
 * 2. For each expired stage:
 *    a. Mark stage as 'completed'
 *    b. Get contestants sorted by totalVotes DESC
 *    c. For contestants below minVotes: mark as 'eliminated'
 *    d. For contestants at/above minVotes: move to next stage (if exists)
 * 3. Activate the next stage if it exists and is 'upcoming'
 */
export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    if (!rateLimit(ip, 10)) {
      return error('Too many requests. Please slow down.', 429);
    }

    const { user: admin, error: authError } = await requireAdmin(request);
    if (authError) return authError;

    const result = await processExpiredStages();
    return success(result, 200, {
      message: result.stagesProcessed > 0
        ? `Processed ${result.stagesProcessed} stage(s): ${result.eliminated} eliminated, ${result.advanced} advanced`
        : 'No expired stages to process',
    });
  } catch (err) {
    console.error('Stage progression error:', err);
    return error('Failed to process stage progression', 500);
  }
}

export async function processExpiredStages(): Promise<{
  stagesProcessed: number;
  eliminated: number;
  advanced: number;
  details: { stageName: string; eliminated: number; advanced: number; nextStageName?: string }[];
}> {
  const now = new Date();

  // Find all non-completed stages that have ended
  const expiredStages = await db.tournamentStage.findMany({
    where: {
      endDate: { lte: now },
      status: { not: 'completed' },
    },
    orderBy: { endDate: 'asc' },
    include: {
      tournament: { select: { id: true, name: true, status: true } },
      contestants: {
        where: { status: 'active' },
        orderBy: { totalVotes: 'desc' },
      },
    },
  });

  let totalEliminated = 0;
  let totalAdvanced = 0;
  const details: { stageName: string; eliminated: number; advanced: number; nextStageName?: string }[] = [];

  for (const stage of expiredStages) {
    let eliminatedCount = 0;
    let advancedCount = 0;

    // Find the next stage in this tournament
    const nextStage = await db.tournamentStage.findFirst({
      where: {
        tournamentId: stage.tournamentId,
        order: { gt: stage.order },
        status: { not: 'completed' },
      },
      orderBy: { order: 'asc' },
    });

    // Process contestants in this stage
    for (const contestant of stage.contestants) {
      if (contestant.totalVotes >= stage.minVotes) {
        // Contestant qualifies — advance to next stage or keep in current
        if (nextStage) {
          await db.contestant.update({
            where: { id: contestant.id },
            data: { stageId: nextStage.id },
          });
          advancedCount++;
        }
        // If no next stage, contestant stays and is considered a finalist/winner
      } else {
        // Contestant doesn't meet threshold — eliminate
        await db.contestant.update({
          where: { id: contestant.id },
          data: {
            status: 'eliminated',
            eliminatedAt: now,
            eliminationReason: `Did not meet minimum vote requirement of ${stage.minVotes} in "${stage.name}" (had ${contestant.totalVotes} votes)`,
            eliminatedById: null, // System elimination
          },
        });
        eliminatedCount++;
      }
    }

    // Mark this stage as completed
    await db.tournamentStage.update({
      where: { id: stage.id },
      data: { status: 'completed' },
    });

    // Activate next stage if exists and the tournament is still active
    if (nextStage && stage.tournament.status === 'active') {
      const nextStageStartDate = new Date(nextStage.startDate);
      if (nextStageStartDate <= now) {
        await db.tournamentStage.update({
          where: { id: nextStage.id },
          data: { status: 'active' },
        });
      }
    }

    totalEliminated += eliminatedCount;
    totalAdvanced += advancedCount;
    details.push({
      stageName: stage.name,
      eliminated: eliminatedCount,
      advanced: advancedCount,
      nextStageName: nextStage?.name,
    });
  }

  return {
    stagesProcessed: expiredStages.length,
    eliminated: totalEliminated,
    advanced: totalAdvanced,
    details,
  };
}
