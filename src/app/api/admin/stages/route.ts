import { NextRequest } from 'next/server';
import { db, withTransaction } from '@/lib/db';
import { success, error, requireAdmin, rateLimit, getClientIp } from '@/lib/api-helpers';

const VALID_STATUSES = ['upcoming', 'active', 'completed'];

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    if (!rateLimit(ip, 60)) {
      return error('Too many requests. Please slow down.', 429);
    }

    const { user: admin, error: authError } = await requireAdmin(request);
    if (authError) return authError;

    const body = await request.json();
    const { tournamentId, name, description, startDate, endDate, status, order, minVotes, maxContestants } = body;

    // Validate required fields
    if (!tournamentId || typeof tournamentId !== 'string') {
      return error('Tournament ID is required', 400);
    }
    if (!name || typeof name !== 'string' || name.trim().length < 1) {
      return error('Stage name is required', 400);
    }
    if (!startDate || isNaN(Date.parse(startDate))) {
      return error('Valid start date is required', 400);
    }
    if (!endDate || isNaN(Date.parse(endDate))) {
      return error('Valid end date is required', 400);
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    if (end <= start) {
      return error('End date must be after start date', 400);
    }

    // Validate tournament exists
    const tournament = await db.tournament.findUnique({ where: { id: tournamentId } });
    if (!tournament) {
      return error('Tournament not found', 404);
    }

    if (status !== undefined && !VALID_STATUSES.includes(status)) {
      return error('Invalid status. Must be one of: upcoming, active, completed', 400);
    }

    // Validate minVotes
    const parsedMinVotes = typeof minVotes === 'number' ? minVotes : 0;
    if (parsedMinVotes < 0) {
      return error('Minimum votes must be 0 or greater', 400);
    }

    const stage = await db.tournamentStage.create({
      data: {
        tournamentId,
        name: name.trim(),
        description: typeof description === 'string' ? description.trim() : null,
        startDate: start,
        endDate: end,
        status: status || 'upcoming',
        order: typeof order === 'number' ? order : 0,
        minVotes: parsedMinVotes,
        maxContestants: typeof maxContestants === 'number' ? maxContestants : null,
      },
    });

    return success(stage, 201, { message: 'Tournament stage created successfully' });
  } catch (err) {
    const msg = err instanceof Error ? err.message : '';
    if (msg.includes('Unique')) {
      return error('A stage with this configuration already exists', 409);
    }
    console.error('Create stage error:', err);
    return error('Failed to create tournament stage', 500);
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
    const { stageId, name, description, startDate, endDate, status, order, minVotes, maxContestants } = body;

    if (!stageId || typeof stageId !== 'string') {
      return error('Stage ID is required', 400);
    }

    const existing = await db.tournamentStage.findUnique({
      where: { id: stageId },
      include: { tournament: { select: { id: true, status: true } } },
    });
    if (!existing) {
      return error('Tournament stage not found', 404);
    }

    // Validate dates if provided
    let parsedStart: Date | undefined;
    let parsedEnd: Date | undefined;

    if (startDate) {
      if (isNaN(Date.parse(startDate))) {
        return error('Invalid start date format', 400);
      }
      parsedStart = new Date(startDate);
    }
    if (endDate) {
      if (isNaN(Date.parse(endDate))) {
        return error('Invalid end date format', 400);
      }
      parsedEnd = new Date(endDate);
    }

    const effectiveStart = parsedStart || existing.startDate;
    const effectiveEnd = parsedEnd || existing.endDate;
    if (effectiveEnd <= effectiveStart) {
      return error('End date must be after start date', 400);
    }

    if (status !== undefined && !VALID_STATUSES.includes(status)) {
      return error('Invalid status. Must be one of: upcoming, active, completed', 400);
    }

    // If activating a stage, check that no other stage in the same tournament is active
    if (status === 'active' && existing.status !== 'active') {
      const otherActive = await db.tournamentStage.findFirst({
        where: {
          tournamentId: existing.tournamentId,
          status: 'active',
          id: { not: stageId },
        },
      });
      if (otherActive) {
        return error(`Another stage ("${otherActive.name}") is already active. Complete it first.`, 409);
      }
    }

    const stage = await db.tournamentStage.update({
      where: { id: stageId },
      data: {
        ...(name !== undefined && { name: typeof name === 'string' ? name.trim() : name }),
        ...(description !== undefined && { description: typeof description === 'string' ? description.trim() : description }),
        ...(parsedStart && { startDate: parsedStart }),
        ...(parsedEnd && { endDate: parsedEnd }),
        ...(status !== undefined && { status }),
        ...(order !== undefined && { order }),
        ...(minVotes !== undefined && { minVotes: typeof minVotes === 'number' ? Math.max(0, minVotes) : 0 }),
        ...(maxContestants !== undefined && { maxContestants: maxContestants === null ? null : maxContestants }),
      },
    });

    return success(stage, 200, { message: 'Tournament stage updated successfully' });
  } catch (err) {
    console.error('Update stage error:', err);
    return error('Failed to update tournament stage', 500);
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
    const stageId = searchParams.get('id');

    if (!stageId) {
      return error('Stage ID is required', 400);
    }

    const existing = await db.tournamentStage.findUnique({
      where: { id: stageId },
      include: { _count: { select: { contestants: true } } },
    });
    if (!existing) {
      return error('Tournament stage not found', 404);
    }

    if (existing.status === 'active') {
      return error('Cannot delete an active stage. Complete it first.', 400);
    }

    if (existing._count.contestants > 0) {
      return error(
        `Cannot delete stage with ${existing._count.contestants} contestant(s). Move or remove contestants first.`,
        400
      );
    }

    await db.tournamentStage.delete({ where: { id: stageId } });

    return success(null, 200, { message: 'Stage deleted successfully' });
  } catch (err) {
    console.error('Delete stage error:', err);
    return error('Failed to delete tournament stage', 500);
  }
}
