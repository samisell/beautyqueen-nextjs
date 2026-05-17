import { NextRequest, NextResponse } from 'next/server';
import { db, withTransaction } from '@/lib/db';
import { success, error, requireAdmin, rateLimit, getClientIp } from '@/lib/api-helpers';
import { createNotification } from '@/lib/notify';

// ---------------------------------------------------------------------------
// GET /api/admin/tasks/submissions?taskId=xxx   — List submissions for a task
// ---------------------------------------------------------------------------

export async function GET(request: NextRequest) {
  try {
    const { user: admin, error: authError } = await requireAdmin(request);
    if (authError) return authError;

    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get('taskId');

    if (!taskId) {
      return error('Task ID is required', 400);
    }

    // Validate task exists
    const task = await db.stageTask.findUnique({ where: { id: taskId } });
    if (!task) {
      return error('Task not found', 404);
    }

    const submissions = await db.taskSubmission.findMany({
      where: { taskId },
      orderBy: { createdAt: 'desc' },
      include: {
        contestant: {
          select: { id: true, name: true, imageUrl: true },
        },
        ratedBy: {
          select: { id: true, name: true },
        },
      },
    });

    return success(submissions);
  } catch (err) {
    console.error('List submissions error:', err);
    return error('Failed to load submissions', 500);
  }
}

// ---------------------------------------------------------------------------
// POST /api/admin/tasks/submissions   — Rate a submission and award bonus votes
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
    const { submissionId, beautyRating, feedback, bonusVotes } = body;

    if (!submissionId || typeof submissionId !== 'string') {
      return error('Submission ID is required', 400);
    }
    if (typeof beautyRating !== 'number' || beautyRating < 1 || beautyRating > 10) {
      return error('Beauty rating must be a number between 1 and 10', 400);
    }

    // Fetch submission with task info
    const submission = await db.taskSubmission.findUnique({
      where: { id: submissionId },
      include: {
        task: true,
        contestant: {
          select: { id: true, name: true, totalVotes: true, userId: true },
        },
      },
    });

    if (!submission) {
      return error('Submission not found', 404);
    }

    if (submission.status !== 'pending') {
      return error('Submission has already been rated', 400);
    }

    // Calculate bonus votes
    let calculatedBonus = bonusVotes;
    if (typeof bonusVotes !== 'number' || bonusVotes <= 0) {
      // Default: bonus = rating * task.maxBonusVotes / 10 (rounded down)
      calculatedBonus = Math.floor(beautyRating * submission.task.maxBonusVotes / 10);
    }

    // Cap bonus votes: task.maxBonusVotes - already awarded to this contestant for this task
    const alreadyAwarded = await db.taskSubmission.aggregate({
      where: {
        taskId: submission.taskId,
        contestantId: submission.contestantId,
        status: 'rated',
      },
      _sum: { bonusVotesAwarded: true },
    });
    const totalAwarded = alreadyAwarded._sum.bonusVotesAwarded || 0;
    const maxAllowed = submission.task.maxBonusVotes - totalAwarded;
    const finalBonus = Math.max(0, Math.min(calculatedBonus, maxAllowed));

    // Execute rating in a transaction
    const updatedSubmission = await withTransaction(async (tx) => {
      // 1. Update submission status
      const updated = await tx.taskSubmission.update({
        where: { id: submissionId },
        data: {
          status: 'rated',
          beautyRating,
          feedback: typeof feedback === 'string' ? feedback.trim() : null,
          bonusVotesAwarded: finalBonus,
          ratedById: admin.userId,
          ratedAt: new Date(),
        },
        include: {
          contestant: {
            select: { id: true, name: true, totalVotes: true, userId: true },
          },
          task: true,
        },
      });

      // 2. Create BonusVote record if bonus > 0
      if (finalBonus > 0) {
        await tx.bonusVote.create({
          data: {
            contestantId: submission.contestantId,
            votesAdded: finalBonus,
            reason: `Task rating: "${submission.task.title}" — Rating ${beautyRating}/10`,
            addedById: admin.userId,
          },
        });

        // 3. Increment contestant totalVotes
        await tx.contestant.update({
          where: { id: submission.contestantId },
          data: { totalVotes: { increment: finalBonus } },
        });
      }

      return updated;
    });

    // 4. Create notification for contestant user (fire-and-forget, outside transaction)
    if (submission.contestant.userId) {
      createNotification({
        userId: submission.contestant.userId,
        title: `Task Rating: ${beautyRating}/10`,
        message: `Your submission for "${submission.task.title}" received a beauty rating of ${beautyRating}/10${finalBonus > 0 ? ` and earned ${finalBonus} bonus votes!` : '.'}`,
        type: finalBonus > 0 ? 'success' : 'info',
      }).catch(() => {});
    }

    return success({
      ...updatedSubmission,
      bonusVotesInfo: {
        rating: beautyRating,
        requested: calculatedBonus,
        maxAllowed,
        awarded: finalBonus,
        totalAwardedForTask: totalAwarded + finalBonus,
        taskMaxBonus: submission.task.maxBonusVotes,
      },
    });
  } catch (err) {
    console.error('Rate submission error:', err);
    return error('Failed to rate submission', 500);
  }
}
