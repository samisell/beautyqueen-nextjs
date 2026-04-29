import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { success, error, requireAdmin, rateLimit, getClientIp } from '@/lib/api-helpers';

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    if (!rateLimit(ip, 60)) {
      return error('Too many requests. Please slow down.', 429);
    }

    const { user: admin, error: authError } = await requireAdmin(request);
    if (authError) return authError;

    const body = await request.json();
    const { name, description, startDate, endDate, status, order, maxContestants } = body;

    // Validate required fields
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

    // Validate status
    if (status !== undefined && !['upcoming', 'active', 'completed'].includes(status)) {
      return error('Invalid status. Must be one of: upcoming, active, completed', 400);
    }

    const stage = await db.tournamentStage.create({
      data: {
        name: name.trim(),
        description: typeof description === 'string' ? description.trim() : null,
        startDate: start,
        endDate: end,
        status: status || 'upcoming',
        order: typeof order === 'number' ? order : 0,
        maxContestants: typeof maxContestants === 'number' ? maxContestants : null,
      },
    });

    return success(stage, 201, { message: 'Tournament stage created successfully' });
  } catch (err) {
    const msg = err instanceof Error ? err.message : '';
    if (msg.includes('Unique')) {
      return error('A tournament stage with this name already exists', 409);
    }
    console.error('Create tournament stage error:', err);
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
    const { stageId, name, description, startDate, endDate, status, order, maxContestants } = body;

    if (!stageId || typeof stageId !== 'string') {
      return error('Stage ID is required', 400);
    }

    // Verify stage exists
    const existing = await db.tournamentStage.findUnique({ where: { id: stageId } });
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

    // Validate date ordering if both provided
    const effectiveStart = parsedStart || existing.startDate;
    const effectiveEnd = parsedEnd || existing.endDate;
    if (effectiveEnd <= effectiveStart) {
      return error('End date must be after start date', 400);
    }

    // Validate status if provided
    if (status !== undefined && !['upcoming', 'active', 'completed'].includes(status)) {
      return error('Invalid status. Must be one of: upcoming, active, completed', 400);
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
        ...(maxContestants !== undefined && { maxContestants: maxContestants === null ? null : maxContestants }),
      },
    });

    return success(stage, 200, { message: 'Tournament stage updated successfully' });
  } catch (err) {
    console.error('Update tournament stage error:', err);
    return error('Failed to update tournament stage', 500);
  }
}
