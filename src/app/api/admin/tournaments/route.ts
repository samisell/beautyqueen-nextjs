import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { success, error, requireAdmin, rateLimit, getClientIp } from '@/lib/api-helpers';

const VALID_STATUSES = ['draft', 'active', 'completed', 'archived'];

export async function GET(_request: NextRequest) {
  try {
    const { user: admin, error: authError } = await requireAdmin(_request);
    if (authError) return authError;

    const tournaments = await db.tournament.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { stages: true },
        },
      },
    });

    // Enrich with stage details
    const enriched = await Promise.all(
      tournaments.map(async (t) => {
        const stages = await db.tournamentStage.findMany({
          where: { tournamentId: t.id },
          orderBy: { order: 'asc' },
          include: {
            _count: {
              select: { contestants: true },
            },
          },
        });

        return {
          id: t.id,
          name: t.name,
          description: t.description,
          status: t.status,
          createdAt: t.createdAt,
          updatedAt: t.updatedAt,
          stageCount: t._count.stages,
          stages: stages.map((s) => ({
            id: s.id,
            name: s.name,
            description: s.description,
            startDate: s.startDate,
            endDate: s.endDate,
            status: s.status,
            order: s.order,
            minVotes: s.minVotes,
            maxContestants: s.maxContestants,
            contestantCount: s._count.contestants,
          })),
        };
      })
    );

    return success(enriched);
  } catch (err) {
    console.error('Get tournaments error:', err);
    return error('Failed to load tournaments', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    if (!rateLimit(ip, 60)) {
      return error('Too many requests. Please slow down.', 429);
    }

    const { user: admin, error: authError } = await requireAdmin(request);
    if (authError) return authError;

    const body = await request.json();
    const { name, description, status } = body;

    if (!name || typeof name !== 'string' || name.trim().length < 1) {
      return error('Tournament name is required', 400);
    }
    if (name.trim().length > 200) {
      return error('Tournament name must be at most 200 characters', 400);
    }

    const tournamentStatus = status && VALID_STATUSES.includes(status) ? status : 'draft';

    // If activating, check no other tournament is active
    if (tournamentStatus === 'active') {
      const existingActive = await db.tournament.findFirst({
        where: { status: 'active' },
      });
      if (existingActive) {
        return error('Another tournament is already active. Deactivate it first.', 409);
      }
    }

    const tournament = await db.tournament.create({
      data: {
        name: name.trim(),
        description: typeof description === 'string' ? description.trim() : null,
        status: tournamentStatus,
      },
    });

    return success(tournament, 201, { message: 'Tournament created successfully' });
  } catch (err) {
    console.error('Create tournament error:', err);
    return error('Failed to create tournament', 500);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    if (!rateLimit(ip, 60)) {
      return error('Too many requests. Please slow down.', 429);
    }

    const { user: admin, error: authError } = await requireAdmin(request);
    if (authError) return authError;

    const body = await request.json();
    const { tournamentId, name, description, status } = body;

    if (!tournamentId || typeof tournamentId !== 'string') {
      return error('Tournament ID is required', 400);
    }

    const existing = await db.tournament.findUnique({ where: { id: tournamentId } });
    if (!existing) {
      return error('Tournament not found', 404);
    }

    if (status !== undefined && !VALID_STATUSES.includes(status)) {
      return error(`Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}`, 400);
    }

    // If activating, check no other tournament is active
    if (status === 'active' && existing.status !== 'active') {
      const existingActive = await db.tournament.findFirst({
        where: { status: 'active', id: { not: tournamentId } },
      });
      if (existingActive) {
        return error('Another tournament is already active. Deactivate it first.', 409);
      }
    }

    // If completing, also complete all active stages
    if (status === 'completed' && existing.status !== 'completed') {
      await db.tournamentStage.updateMany({
        where: { tournamentId, status: 'active' },
        data: { status: 'completed' },
      });
    }

    const tournament = await db.tournament.update({
      where: { id: tournamentId },
      data: {
        ...(name !== undefined && { name: typeof name === 'string' ? name.trim() : name }),
        ...(description !== undefined && { description: typeof description === 'string' ? description.trim() : description }),
        ...(status !== undefined && { status }),
      },
    });

    return success(tournament, 200, { message: 'Tournament updated successfully' });
  } catch (err) {
    console.error('Update tournament error:', err);
    return error('Failed to update tournament', 500);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    if (!rateLimit(ip, 30)) {
      return error('Too many requests. Please slow down.', 429);
    }

    const { user: admin, error: authError } = await requireAdmin(request);
    if (authError) return authError;

    const { searchParams } = new URL(request.url);
    const tournamentId = searchParams.get('id');

    if (!tournamentId) {
      return error('Tournament ID is required', 400);
    }

    const existing = await db.tournament.findUnique({
      where: { id: tournamentId },
      include: { stages: { select: { id: true, _count: { select: { contestants: true } } } } },
    });

    if (!existing) {
      return error('Tournament not found', 404);
    }

    if (existing.status === 'active') {
      return error('Cannot delete an active tournament. Deactivate it first.', 400);
    }

    const totalContestants = existing.stages.reduce((sum, s) => sum + s._count.contestants, 0);
    if (totalContestants > 0) {
      return error(
        `Cannot delete tournament with ${totalContestants} contestant(s) assigned. Remove contestants from all stages first.`,
        400
      );
    }

    await db.tournamentStage.deleteMany({ where: { tournamentId } });
    await db.tournament.delete({ where: { id: tournamentId } });

    return success(null, 200, { message: 'Tournament deleted successfully' });
  } catch (err) {
    console.error('Delete tournament error:', err);
    return error('Failed to delete tournament', 500);
  }
}
