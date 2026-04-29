import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { success, error, getUserFromRequest, requireAdmin } from '@/lib/api-helpers';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const contestant = await db.contestant.findUnique({
      where: { id },
      include: {
        categoryRel: true,
        stage: true,
      },
    });

    if (!contestant) {
      return error('Contestant not found', 404);
    }

    // Include vote count breakdown
    const voteStats = await db.vote.groupBy({
      by: ['contestantId'],
      where: { contestantId: id },
      _count: true,
    });

    return success({
      ...contestant,
      voteCount: voteStats.length > 0 ? voteStats[0]._count : 0,
    });
  } catch (err) {
    console.error('Get contestant error:', err);
    return error('Failed to load contestant', 500);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const adminResult = await requireAdmin(request);
    if (adminResult.error) return adminResult.error;

    const { id } = await params;

    // Verify contestant exists
    const existing = await db.contestant.findUnique({ where: { id } });
    if (!existing) {
      return error('Contestant not found', 404);
    }

    const body = await request.json();
    const { name, bio, imageUrl, category, categoryId, status, stageId } = body;

    // Validate status if provided
    if (status !== undefined) {
      if (!['active', 'eliminated', 'winner'].includes(status)) {
        return error('Invalid status. Must be one of: active, eliminated, winner', 400);
      }
    }

    // Validate name if provided
    if (name !== undefined && (typeof name !== 'string' || name.trim().length < 1 || name.trim().length > 200)) {
      return error('Name must be between 1 and 200 characters', 400);
    }

    const contestant = await db.contestant.update({
      where: { id },
      data: {
        ...(name !== undefined && { name: name.trim() }),
        ...(bio !== undefined && { bio: typeof bio === 'string' ? bio.trim() : bio }),
        ...(imageUrl !== undefined && { imageUrl }),
        ...(category !== undefined && { category }),
        ...(categoryId !== undefined && { categoryId: categoryId || null }),
        ...(status !== undefined && { status }),
        ...(stageId !== undefined && { stageId: stageId || null }),
      },
      include: { categoryRel: true, stage: true },
    });

    return success(contestant, 200, { message: 'Contestant updated successfully' });
  } catch (err) {
    console.error('Update contestant error:', err);
    return error('Failed to update contestant', 500);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const adminResult = await requireAdmin(request);
    if (adminResult.error) return adminResult.error;

    const { id } = await params;

    // Verify contestant exists
    const existing = await db.contestant.findUnique({
      where: { id },
      select: { id: true, name: true },
    });
    if (!existing) {
      return error('Contestant not found', 404);
    }

    // Delete contestant (votes cascade automatically via schema)
    await db.contestant.delete({ where: { id } });

    return success({ message: `Contestant "${existing.name}" deleted successfully` });
  } catch (err) {
    console.error('Delete contestant error:', err);
    return error('Failed to delete contestant', 500);
  }
}
