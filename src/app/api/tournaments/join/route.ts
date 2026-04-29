import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { success, error, getUserFromRequest, rateLimit, getClientIp } from '@/lib/api-helpers';
import { sendTournamentJoinedEmail } from '@/lib/email';

/**
 * POST /api/tournaments/join
 *
 * Lets a verified user join an active tournament and become a contestant.
 *
 * Body: { tournamentId: string, stageId: string, name: string, bio?: string, imageUrl: string, category: string }
 * Auth: Bearer token (user must be verified)
 */
export async function POST(request: NextRequest) {
  try {
    // Rate limit: 5/min/IP
    const ip = getClientIp(request);
    if (!rateLimit(ip, 5)) {
      return error('Too many requests. Please try again later.', 429);
    }

    const { user, error: authError } = await getUserFromRequest(request);
    if (authError) return authError;

    const body = await request.json();
    const { tournamentId, stageId, name, bio, imageUrl, category } = body;

    // Validate required fields
    if (!tournamentId || typeof tournamentId !== 'string') {
      return error('Tournament ID is required');
    }
    if (!stageId || typeof stageId !== 'string') {
      return error('Stage ID is required');
    }
    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return error('Name must be at least 2 characters');
    }
    if (!imageUrl || typeof imageUrl !== 'string') {
      return error('Profile image is required');
    }
    if (!category || typeof category !== 'string') {
      return error('Category is required');
    }

    // Fetch user from DB to check verification
    const userRecord = await db.user.findUnique({
      where: { id: user.userId },
      select: { id: true, name: true, email: true, isVerified: true },
    });

    if (!userRecord) {
      return error('User not found', 404);
    }

    if (!userRecord.isVerified) {
      return error('Please verify your email address before joining a tournament', 403);
    }

    // Check user doesn't already have a contestant profile
    const existingContestant = await db.contestant.findUnique({
      where: { userId: user.userId },
    });

    if (existingContestant) {
      return error('You already have a contestant profile. You cannot join multiple tournaments simultaneously.', 409);
    }

    // Fetch the tournament
    const tournament = await db.tournament.findUnique({
      where: { id: tournamentId },
      include: { stages: true },
    });

    if (!tournament) {
      return error('Tournament not found', 404);
    }

    if (tournament.status !== 'active') {
      return error('This tournament is not currently accepting new contestants', 400);
    }

    // Fetch and validate the stage
    const stage = await db.tournamentStage.findUnique({
      where: { id: stageId },
      include: { contestants: true },
    });

    if (!stage) {
      return error('Stage not found', 404);
    }

    if (stage.tournamentId !== tournamentId) {
      return error('This stage does not belong to the specified tournament', 400);
    }

    // Stage must be "active" or "upcoming"
    if (stage.status !== 'active' && stage.status !== 'upcoming') {
      return error('This stage is no longer accepting new contestants', 400);
    }

    // Check that startDate is not too far in the future (max 30 days)
    const now = new Date();
    const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
    if (stage.startDate.getTime() - now.getTime() > thirtyDaysMs) {
      return error('This stage is not yet open for registration', 400);
    }

    // Check maxContestants limit
    if (stage.maxContestants !== null && stage.contestants.length >= stage.maxContestants) {
      return error('This stage has reached its maximum number of contestants', 400);
    }

    // Look up optional category relation
    let categoryId: string | undefined;
    if (category) {
      const categoryRecord = await db.category.findUnique({
        where: { name: category },
      });
      if (categoryRecord) {
        categoryId = categoryRecord.id;
      }
    }

    // Create the contestant
    const contestant = await db.contestant.create({
      data: {
        name: name.trim(),
        bio: bio?.trim() || null,
        imageUrl,
        category,
        categoryId: categoryId || null,
        status: 'active',
        totalVotes: 0,
        stageId,
        userId: user.userId,
      },
      include: {
        stage: {
          include: {
            tournament: true,
          },
        },
        categoryRel: true,
      },
    });

    // Send tournament joined email (fire-and-forget)
    const contestantId = contestant.id.substring(0, 8).toUpperCase();
    sendTournamentJoinedEmail(
      userRecord.id,
      userRecord.name,
      userRecord.email,
      {
        tournamentName: contestant.stage?.tournament.name || tournament.name,
        stageName: contestant.stage?.name || 'Unknown Stage',
        contestantId,
      }
    ).catch(() => { /* fire-and-forget */ });

    return success(
      {
        id: contestant.id,
        name: contestant.name,
        bio: contestant.bio,
        imageUrl: contestant.imageUrl,
        category: contestant.category,
        status: contestant.status,
        totalVotes: contestant.totalVotes,
        createdAt: contestant.createdAt,
        stage: contestant.stage
          ? {
              id: contestant.stage.id,
              name: contestant.stage.name,
            }
          : null,
        tournament: contestant.stage?.tournament
          ? {
              id: contestant.stage.tournament.id,
              name: contestant.stage.tournament.name,
            }
          : null,
      },
      201,
      { message: 'Successfully joined the tournament!' }
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : '';
    if (msg.includes('Unique')) {
      return error('A contestant profile already exists for this user', 409);
    }
    console.error('Join tournament error:', err);
    return error('Failed to join tournament. Please try again.', 500);
  }
}
