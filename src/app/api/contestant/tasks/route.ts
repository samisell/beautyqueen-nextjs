import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { success, error, getUserFromRequest, rateLimit, getClientIp } from '@/lib/api-helpers';
import { createNotification } from '@/lib/notify';

// ---------------------------------------------------------------------------
// GET /api/contestant/tasks   — Get tasks for current contestant's stage
// ---------------------------------------------------------------------------

export async function GET(request: NextRequest) {
  try {
    const { user, error: authError } = await getUserFromRequest(request);
    if (authError) return authError;

    // Find contestant by userId
    const contestant = await db.contestant.findUnique({
      where: { userId: user.userId },
      select: { id: true, stageId: true },
    });

    if (!contestant || !contestant.stageId) {
      return success([]);
    }

    // Get active tasks for the contestant's stage, each with the contestant's submission
    const tasks = await db.stageTask.findMany({
      where: {
        stageId: contestant.stageId,
        status: 'active',
      },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { submissions: true } },
        submissions: {
          where: { contestantId: contestant.id },
          take: 1,
        },
      },
    });

    return success(tasks);
  } catch (err) {
    console.error('Get contestant tasks error:', err);
    return error('Failed to load tasks', 500);
  }
}

// ---------------------------------------------------------------------------
// POST /api/contestant/tasks   — Submit work for a task
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    if (!rateLimit(ip, 30)) {
      return error('Too many requests. Please slow down.', 429);
    }

    const { user, error: authError } = await getUserFromRequest(request);
    if (authError) return authError;

    const body = await request.json();
    const { taskId, submissionUrl, caption } = body;

    if (!taskId || typeof taskId !== 'string') {
      return error('Task ID is required', 400);
    }
    if (!submissionUrl || typeof submissionUrl !== 'string' || submissionUrl.trim().length === 0) {
      return error('Submission URL is required', 400);
    }

    // Find contestant by userId
    const contestant = await db.contestant.findUnique({
      where: { userId: user.userId },
      select: { id: true, name: true, stageId: true },
    });

    if (!contestant) {
      return error('You do not have a contestant profile', 404);
    }

    // Validate task exists
    const task = await db.stageTask.findUnique({
      where: { id: taskId },
      select: { id: true, title: true, stageId: true, status: true },
    });

    if (!task) {
      return error('Task not found', 404);
    }

    // Validate task belongs to contestant's stage
    if (task.stageId !== contestant.stageId) {
      return error('This task does not belong to your stage', 403);
    }

    // Validate task is active
    if (task.status !== 'active') {
      return error('This task is no longer accepting submissions', 400);
    }

    // Check for existing submission
    const existingSubmission = await db.taskSubmission.findFirst({
      where: { taskId, contestantId: contestant.id },
    });
    if (existingSubmission) {
      return error('You have already submitted work for this task', 400);
    }

    // Create submission
    const submission = await db.taskSubmission.create({
      data: {
        taskId,
        contestantId: contestant.id,
        submissionUrl: submissionUrl.trim(),
        caption: typeof caption === 'string' ? caption.trim() : null,
        status: 'pending',
      },
      include: {
        task: { select: { id: true, title: true } },
      },
    });

    // Create notification for user about successful submission
    createNotification({
      userId: user.userId,
      title: 'Task Submission Received',
      message: `Your submission for "${task.title}" has been received and is pending review.`,
      type: 'success',
    }).catch(() => {});

    return success(submission, 201);
  } catch (err) {
    console.error('Submit task error:', err);
    return error('Failed to submit task', 500);
  }
}
