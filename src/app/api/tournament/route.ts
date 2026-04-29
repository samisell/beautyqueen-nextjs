import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { success, error } from '@/lib/api-helpers';

export async function GET(_request: NextRequest) {
  try {
    const stages = await db.tournamentStage.findMany({
      orderBy: { order: 'asc' },
      include: {
        _count: {
          select: { contestants: true },
        },
      },
    });

    // Get top 3 contestants per stage
    const stagesWithDetails = await Promise.all(
      stages.map(async (stage) => {
        const topContestants = await db.contestant.findMany({
          where: { stageId: stage.id },
          orderBy: { totalVotes: 'desc' },
          take: 3,
          select: {
            id: true,
            name: true,
            imageUrl: true,
            totalVotes: true,
            status: true,
          },
        });

        return {
          id: stage.id,
          name: stage.name,
          description: stage.description,
          startDate: stage.startDate,
          endDate: stage.endDate,
          status: stage.status,
          order: stage.order,
          maxContestants: stage.maxContestants,
          contestantCount: stage._count.contestants,
          topContestants,
        };
      })
    );

    return success(stagesWithDetails);
  } catch (err) {
    console.error('Tournament error:', err);
    return error('Failed to load tournament data', 500);
  }
}
