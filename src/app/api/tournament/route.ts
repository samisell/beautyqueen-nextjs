import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { success, error } from '@/lib/api-helpers';

export async function GET(_request: NextRequest) {
  try {
    // Get platform settings (public)
    const settings = await db.platformSetting.findMany();
    const settingsMap: Record<string, string> = {
      votePrice: '200',
      currency: 'NGN',
      platformName: 'Beauty Vote',
      votingEnabled: 'true',
    };
    for (const s of settings) {
      settingsMap[s.key] = s.value;
    }

    // Get active or most recent tournament
    const tournament = await db.tournament.findFirst({
      where: {
        status: { in: ['active', 'completed'] },
      },
      orderBy: { createdAt: 'desc' },
      include: {
        stages: {
          orderBy: { order: 'asc' },
          include: {
            _count: {
              select: { contestants: true },
            },
          },
        },
      },
    });

    if (!tournament) {
      return success({
        votePrice: Number(settingsMap['votePrice'] || '200'),
        currency: settingsMap['currency'] || 'NGN',
        platformName: settingsMap['platformName'] || 'Beauty Vote',
        votingEnabled: settingsMap['votingEnabled'] !== 'false',
        tournament: null,
      });
    }

    // Get detailed stage data including contestants
    const stagesWithDetails = await Promise.all(
      tournament.stages.map(async (stage) => {
        const contestants = await db.contestant.findMany({
          where: { stageId: stage.id },
          orderBy: { totalVotes: 'desc' },
          select: {
            id: true,
            name: true,
            imageUrl: true,
            totalVotes: true,
            status: true,
            category: true,
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
          minVotes: stage.minVotes,
          maxContestants: stage.maxContestants,
          contestantCount: stage._count.contestants,
          contestants: contestants.slice(0, 10), // Top 10 for display
          topContestants: contestants.slice(0, 3),
        };
      })
    );

    return success({
      votePrice: Number(settingsMap['votePrice'] || '200'),
      currency: settingsMap['currency'] || 'NGN',
      platformName: settingsMap['platformName'] || 'Beauty Vote',
      votingEnabled: settingsMap['votingEnabled'] !== 'false',
      tournament: {
        id: tournament.id,
        name: tournament.name,
        description: tournament.description,
        status: tournament.status,
        stages: stagesWithDetails,
      },
    });
  } catch (err) {
    console.error('Tournament error:', err);
    return error('Failed to load tournament data', 500);
  }
}
