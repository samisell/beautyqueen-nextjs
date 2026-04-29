import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { success, error, requireAdmin, rateLimit, getClientIp } from '@/lib/api-helpers';

// ---------------------------------------------------------------------------
// GET /api/admin/tasks?stageId=xxx   — List tasks for a stage (or all tasks)
// ---------------------------------------------------------------------------

export async function GET(request: NextRequest) {
  try {
    const { user: admin, error: authError } = await requireAdmin(request);
    if (authError) return authError;

    const { searchParams } = new URL(request.url);
    const stageId = searchParams.get('stageId');

    const where: Record<string, unknown> = {};
    if (stageId) where.stageId = stageId;

    const tasks = await db.stageTask.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { submissions: true } },
        stage: {
          select: { id: true, name: true, tournament: { select: { id: true, name: true } } },
        },
      },
    });

    return success(tasks);
  } catch (err) {
    console.error('List tasks error:', err);
    return error('Failed to load tasks', 500);
  }
}

// ---------------------------------------------------------------------------
// POST /api/admin/tasks   — Create a new task for a stage
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    if (!rateLimit(ip, 30)) {
      return error('Too many requests. Please slow down.', 429);
    }

    const { user: admin, error: authError } = await requireAdmin(request);
    if (authError) return authError;

    const body = await request.json();
    const { stageId, title, description, instructions, dueDate, maxBonusVotes } = body;

    if (!stageId || typeof stageId !== 'string') {
      return error('Stage ID is required', 400);
    }
    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return error('Title is required', 400);
    }

    // Validate stage exists
    const stage = await db.tournamentStage.findUnique({
      where: { id: stageId },
      select: { id: true, name: true },
    });
    if (!stage) {
      return error('Stage not found', 404);
    }

    const task = await db.stageTask.create({
      data: {
        stageId,
        title: title.trim(),
        description: typeof description === 'string' ? description.trim() : null,
        instructions: typeof instructions === 'string' ? instructions.trim() : null,
        dueDate: dueDate ? new Date(dueDate) : null,
        maxBonusVotes: typeof maxBonusVotes === 'number' ? Math.max(0, maxBonusVotes) : 10,
      },
      include: {
        stage: {
          select: { id: true, name: true, tournament: { select: { id: true, name: true } } },
        },
      },
    });

    return success(task, 201);
  } catch (err) {
    console.error('Create task error:', err);
    return error('Failed to create task', 500);
  }
}

// ---------------------------------------------------------------------------
// PUT /api/admin/tasks   — Update a task
// ---------------------------------------------------------------------------

export async function PUT(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    if (!rateLimit(ip, 30)) {
      return error('Too many requests. Please slow down.', 429);
    }

    const { user: admin, error: authError } = await requireAdmin(request);
    if (authError) return authError;

    const body = await request.json();
    const { taskId, title, description, instructions, dueDate, status, maxBonusVotes } = body;

    if (!taskId || typeof taskId !== 'string') {
      return error('Task ID is required', 400);
    }

    // Validate task exists
    const existing = await db.stageTask.findUnique({ where: { id: taskId } });
    if (!existing) {
      return error('Task not found', 404);
    }

    const updateData: Record<string, unknown> = {};
    if (typeof title === 'string' && title.trim().length > 0) updateData.title = title.trim();
    if (typeof description === 'string') updateData.description = description.trim();
    if (typeof instructions === 'string') updateData.instructions = instructions.trim();
    if (dueDate !== undefined) updateData.dueDate = dueDate ? new Date(dueDate) : null;
    if (typeof status === 'string' && ['active', 'inactive', 'completed', 'cancelled'].includes(status)) {
      updateData.status = status;
    }
    if (typeof maxBonusVotes === 'number') updateData.maxBonusVotes = Math.max(0, maxBonusVotes);

    if (Object.keys(updateData).length === 0) {
      return error('No valid fields to update', 400);
    }

    const task = await db.stageTask.update({
      where: { id: taskId },
      data: updateData,
      include: {
        stage: {
          select: { id: true, name: true, tournament: { select: { id: true, name: true } } },
        },
      },
    });

    return success(task);
  } catch (err) {
    console.error('Update task error:', err);
    return error('Failed to update task', 500);
  }
}

// ---------------------------------------------------------------------------
// DELETE /api/admin/tasks   — Delete a task and its submissions
// ---------------------------------------------------------------------------

export async function DELETE(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    if (!rateLimit(ip, 30)) {
      return error('Too many requests. Please slow down.', 429);
    }

    const { user: admin, error: authError } = await requireAdmin(request);
    if (authError) return authError;

    const body = await request.json();
    const { taskId } = body;

    if (!taskId || typeof taskId !== 'string') {
      return error('Task ID is required', 400);
    }

    // Validate task exists
    const existing = await db.stageTask.findUnique({
      where: { id: taskId },
      include: { _count: { select: { submissions: true } } },
    });
    if (!existing) {
      return error('Task not found', 404);
    }

    // Delete task (submissions are cascade-deleted via schema)
    await db.stageTask.delete({ where: { id: taskId } });

    return success({
      deleted: true,
      taskId,
      submissionsDeleted: existing._count.submissions,
    });
  } catch (err) {
    console.error('Delete task error:', err);
    return error('Failed to delete task', 500);
  }
}
