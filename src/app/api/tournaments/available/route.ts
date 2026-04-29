import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { success, error } from '@/lib/api-helpers';

// GET /api/tournaments/available — Get tournaments with upcoming (not yet started) stages
// Used by eliminated contestants to find new tournaments to enroll in
export async function GET(_request: NextRequest) {
  try {
    const now = new Date();

    // Find tournaments that have at least one stage that hasn't started yet
    const tournaments = await db.tournament.findMany({
      where: {
        status: 'active',
        stages: {
          some: {
            startDate: { gt: now },
          },
        },
      },
      include: {
        stages: {
          where: {
            startDate: { gt: now },
          },
          orderBy: { order: 'asc' },
          select: {
            id: true,
            name: true,
            description: true,
            startDate: true,
            endDate: true,
            order: true,
            minVotes: true,
            maxContestants: true,
            _count: {
              select: { contestants: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const available = tournaments.map((t) => ({
      id: t.id,
      name: t.name,
      description: t.description,
      nextStage: t.stages[0] || null,
      totalStages: t.stages.length,
    }));

    return success(available);
  } catch (err) {
    console.error('Get available tournaments error:', err);
    return error('Failed to load available tournaments', 500);
  }
}
